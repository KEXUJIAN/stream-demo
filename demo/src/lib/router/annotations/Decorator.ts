import * as Type from "../types";
import getNames = require("get-parameter-names");
import "reflect-metadata";

const ControllerKey = Symbol("Router:Controller");
const MethodKey = Symbol("Router:Method");
const ParamsKey = Symbol("Router:Parameters");
const DESIGN_TYPE_KEY = "design:paramtypes";


export class Route {
    static Controller(params?: Type.ControllerProperty) {
        return (constructor: Function) => {
            let p = Object.assign(<Type.ControllerProperty>{
                prefix: "/" + constructor.name.toLowerCase(),
                singleton: false
            }, params);
            Object.defineProperty(constructor, ControllerKey, { value: p });
        };
    }

    static ReqMapping(httpMethod: Type.HttpMethod | Type.HttpMethod[] = 'get', path?: string, ) {
        return (target: any, key: string, des: PropertyDescriptor) => {
            des.enumerable = true;
            if (typeof httpMethod === 'string') {
                httpMethod = [httpMethod]
            }
            let params: string[] = getNames(target[key]);
            let p: Type.MethodProperty = {
                path,
                httpMethod,
                params,
                name: key
            };
            Reflect.defineMetadata(MethodKey, p, target, key);
        };
    }

    static Get(path?: string) {
        return this.ReqMapping('get', path);
    }

    static Post(path?: string) {
        return this.ReqMapping('post', path);
    }

    static ReqQuery(prop?: Type.ParamsReq) {
        return reqParamDec(Object.assign({}, prop, <Type.ParamsProperty>{ reqInjectType: Type.ReqParmInjectType.Query }));
    }

    static ReqBody(prop?: Type.ParamsReq) {
        return reqParamDec(Object.assign({}, prop, <Type.ParamsProperty>{ reqInjectType: Type.ReqParmInjectType.Body }));
    }

    static ReqCtx(prop?: Type.ParamsReq) {
        return reqParamDec(Object.assign({}, prop, <Type.ParamsProperty>{ reqInjectType: Type.ReqParmInjectType.Ctx }));
    }

    static ReqHeader(prop?: Type.ParamsReq) {
        return reqParamDec(Object.assign({}, prop, <Type.ParamsProperty>{ reqInjectType: Type.ReqParmInjectType.Header }));
    }

    static scan(cls: Function) {
        if (!cls.hasOwnProperty(ControllerKey)) {
            return null;
        }
        let result: Type.RouterEntity = {};
        const controllerProp: Type.ControllerProperty = cls[ControllerKey];
        // prefix 一定以 / 开头并且一定不以 / 结尾
        if (!controllerProp.prefix.startsWith('/')) {
            controllerProp.prefix = '/' + controllerProp.prefix;
        }
        if (controllerProp.prefix !== '/' && controllerProp.prefix.endsWith('/')) {
            controllerProp.prefix = controllerProp.prefix.slice(0, controllerProp.prefix.length - 1);
        }
        controllerProp.prefix = controllerProp.prefix.replace(/\s+/g, '');
        result['controller'] = controllerProp;

        let handlerInfoList: Type.HandlerEntity[] = [];
        Object.keys(cls.prototype).forEach(key => {
            if (typeof cls.prototype[key] !== 'function') {
                return;
            }
            const methodInfo: Type.MethodProperty = Reflect.getOwnMetadata(MethodKey, cls.prototype, key);
            if (!methodInfo) {
                return;
            }
            // methodInfo.path 一定以 / 开头
            if (!methodInfo.path) {
                methodInfo.path = `/${key}`;
            } else {
                methodInfo.path = methodInfo.path.replace(/\s+/g, '');
            }
            if (!methodInfo.path.startsWith('/')) {
                methodInfo.path = '/' + methodInfo.path;
            }
            let tmp = <Type.HandlerEntity>Object.assign({}, methodInfo);
            tmp['paramsInfo'] = Reflect.getOwnMetadata(ParamsKey, cls.prototype, key) || [];
            handlerInfoList.push(tmp);
        });
        result['handlers'] = handlerInfoList;
        return result;
    }
}

function reqParamDec(prop?: Type.ParamsProperty) {
    return (target: Object, key: string | symbol, index: number) => {
        let paramsInfo: Type.ParamsProperty[] = Reflect.getOwnMetadata(ParamsKey, target, key) || [];
        let paramType: Function = Reflect.getOwnMetadata(DESIGN_TYPE_KEY, target, key)[index];
        paramsInfo.push(Object.assign(<Type.ParamsProperty>{
            required: true,
            type: paramType.name,
        }, prop, <Type.ParamsProperty>{ index }));
        Reflect.defineMetadata(ParamsKey, paramsInfo, target, key);
    };
}
