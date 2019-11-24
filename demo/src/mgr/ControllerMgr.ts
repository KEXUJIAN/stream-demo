import * as koaRouter from "koa-router";
import * as Type from "../lib/router/types";
import { Context } from "koa";
import { join } from "path";
import { Tool } from "../util/Tool";
import { BaseMgr } from "./base/BaseMgr";
import { BaseCtxController } from "../lib/BaseController";
import { Route } from "../lib/router/annotations/Decorator";
import { FwFile } from "../util/File";

interface InjectParam {
    name: string;
    property?: Type.ParamsProperty;
}

export class ControllerMgr extends BaseMgr {
    private readonly basicType = ['number', 'string', 'boolean', 'object'];
    private readonly dir: string = join(__dirname, '../controller/');

    private controllerList: { controller: any, singleton: boolean, name: string }[] = [];
    private existsUrlMap = {};
    private plugins: Type.RouterPlugin[] = [];
    private pluginEvt: any = {};

    async start() {
        this.emit(BaseMgr.Event.Ready);
    }

    use(obj: Type.RouterPlugin) {
        this.plugins.push(obj);
        obj.evtRegister().forEach(entity => {
            if (!this.pluginEvt[entity.evtName]) {
                this.pluginEvt[entity.evtName] = [];
            }
            this.pluginEvt[entity.evtName].push(entity.handler.bind(obj));
        });
        return this;
    }

    async emitPluginEvt(evtName: string | symbol, ...args: any[]) {
        if (!this.pluginEvt[evtName]) {
            return;
        }
        let result = [];
        for (let i = 0; i < this.pluginEvt[evtName].length; i++) {
            result.push(await this.pluginEvt[evtName][i](...args));
        }
        return result;
    }

    async koaRouter() {
        const router = new koaRouter();
        await Tool.readJsFile(this.dir, this.kRCtrRegister.bind(this, router));
        this.existsUrlMap = {};
        return router;
    }

    private kRCtrRegister(router: koaRouter, filePath: string) {
        const exporter = require(filePath);
        Object.keys(exporter).forEach(key => {
            const controller: Function = exporter[key];
            const property = Route.scan(controller);
            if (!property || property.handlers.length === 0) {
                return;
            }
            let singleton = property.controller.singleton;
            this.controllerList.push({
                controller: this.ctrInit(singleton, controller),
                singleton,
                name: controller.prototype.constructor.name
            });
            Tool.debugLog(`import controller ${controller.prototype.constructor.name} from ${filePath}`);
            this.kRHandlerRegister(router, property);
            delete property.controller;
            delete property.handlers;
        });
    }

    private kRHandlerRegister(router: koaRouter, property: Type.RouterEntity) {
        property.handlers.forEach(handlerEntity => {
            handlerEntity.httpMethod.forEach(httpMethod => {
                let urlPath = handlerEntity.path;
                if (property.controller.prefix !== '/') {
                    urlPath = property.controller.prefix + urlPath
                }
                if (!this.existsUrlMap[httpMethod]) {
                    this.existsUrlMap[httpMethod] = {};
                }
                let ctrIdx = this.controllerList.length - 1;
                if (this.existsUrlMap[httpMethod][urlPath]) {
                    throw new Error(`Redundant ${httpMethod.toUpperCase()} handler for '${urlPath}' in ${this.controllerList[ctrIdx].name}.${handlerEntity.name}`);
                }
                this.existsUrlMap[httpMethod][urlPath] = true;
                router[httpMethod](
                    urlPath,
                    this.kRExec(ctrIdx, handlerEntity)
                );
            });
        });
    }

    private kRExec(i: number, handlerEntity: Type.HandlerEntity): any {
        let cls = this.controllerList[i].controller;
        let singleton = this.controllerList[i].singleton;
        let handlerName = handlerEntity.name;
        let params = this.paramInit(handlerEntity.params, handlerEntity.paramsInfo);
        let ctrMgr = this;
        return async (ctx: koaRouter.RouterContext) => {
            let pList = ctrMgr.kParamInject(params, ctx);
            let tmpCls = cls;
            if (!singleton) {
                tmpCls = new cls();
                tmpCls instanceof BaseCtxController && ((tmpCls as BaseCtxController).ctx = ctx);
            }
            for (let i = 0; i < ctrMgr.plugins.length; i++) {
                await ctrMgr.plugins[i].beforeExecHandler(ctx, tmpCls, handlerName);
            }
            let result = await tmpCls[handlerName](...pList);
            if (result instanceof FwFile) {
                ctx.set('Content-Length', result.size.toString());
                ctx.set('Content-Disposition', `attachment; filename="${result.filename}"`);
                result = result.readStream;
            }
            ctx.response.body = result;
        };
    }

    /**
     * TODO 以后可能有的构造器注入
     * 
     * @param singleton 
     * @param cls 
     */
    private ctrInit(singleton: boolean, cls: any): any {
        return singleton ? new cls() : cls;
    }

    private paramInit(params: string[], infos: Type.ParamsProperty[]) {
        let paramsInfo: InjectParam[] = [];
        infos.forEach(info => {
            if (!info.pName) {
                info.pName = params[info.index];
            }
            paramsInfo[info.index] = {
                name: params[info.index],
                property: Object.assign({}, info)
            };
        });
        params.forEach((param, i) => {
            if (params[i]) {
                return;
            }
            paramsInfo[i] = { name: param };
        });
        return paramsInfo;
    }

    private kParamInject(params: InjectParam[], ctx: Context) {
        let pList = [];
        params.forEach(param => {
            let p = undefined;
            if (!param.property) {
                pList.push(p);
                return;
            }
            switch (param.property.reqInjectType) {
                case Type.ReqParmInjectType.Body:
                    if (!ctx.request.body && param.property.required) {
                        ctx.throw(400);
                    }
                    if (ctx.request.body[param.property.pName] === undefined && param.property.required) {
                        ctx.throw(400);
                    }
                    p = ctx.request.body[param.property.pName];
                    break;
                case Type.ReqParmInjectType.Ctx:
                    p = ctx;
                    break;
                case Type.ReqParmInjectType.Header:
                    if (ctx.get(param.property.pName) === "" && param.property.required) {
                        ctx.throw(400);
                    }
                    p = ctx.get(param.property.pName);
                    break;
                case Type.ReqParmInjectType.Query:
                    if (ctx.request.query[param.property.pName] === undefined && param.property.required) {
                        ctx.throw(400);
                    }
                    p = ctx.request.query[param.property.pName];
            }
            pList.push(this.checkParamType(ctx, p, param.property));
        });
        return pList;
    }

    /**
     * 暂时只检查基本数据类型
     * 
     * @param ctx 
     * @param value 
     * @param property 
     */
    private checkParamType(ctx: Context, value: any, property: Type.ParamsProperty) {
        let type = property.type.toLowerCase();
        if (property.reqInjectType === Type.ReqParmInjectType.Ctx || this.basicType.indexOf(type) === -1) {
            return value
        }
        // null object 就不判断了
        if (typeof value === type || !property.required) {
            return value;
        }
        if (typeof value !== 'string') {
            ctx.throw(400);
        }
        switch (type) {
            case 'number':
                value = Number(value);
                if (!Number.isNaN(value)) {
                    return value;
                }
                break;
            case 'boolean':
                if (value === 'true' || value === 'false') {
                    return value === 'true';
                }
                break;
            case 'object':
                // 不考虑 json 转换的错误, 有错误直接抛 500
               return JSON.parse(value);
        }
        ctx.throw(400);
    }
}
