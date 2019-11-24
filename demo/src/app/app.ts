import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as cors from "koa2-cors";
import { Server } from "http";
import { logUtil } from "../lib/LogUtil";
import { ControllerMgr } from "../mgr/ControllerMgr";
import { MgrFactory } from "../mgr/base/MgrFactory";
import { iApp, IConfig } from "../entity/BaseEntity";
import { join } from "path";
import { Tool } from "../util/Tool";
import { EventEmitter } from "events";

export let mgr: MgrFactory;
export let controllerMgr: ControllerMgr;

declare var global: iApp;

export const AppEvent = {
    ready: "ready.app"
};
export class App extends EventEmitter {
    private server: Server;

    start(mgrLoaded?: (app: App) => Promise<void>, mgrReady?: (app: App) => Promise<void>, exclude?: Function[]) {
        this.handleException();
        this.initCfg();
        this.initMgr(mgrLoaded, mgrReady, exclude);
    }

    private initCfg() {
        let configPath = `config_${process.env.NODE_ENV || 'dev'}.json`;
        configPath = join(__dirname, `/../${configPath}`);
        const config: IConfig = require(configPath);
        global.DBManager = config.DBManager;
        global.Debug = config.debug;
        global.port = config.port;
        global.gameId = config.gameId;
        global.plat = config.plat;
        global.platServer = config.platServer;
        global.ip = Tool.getIPv4();
    }

    initMgr(mgrLoaded?: (app: App) => Promise<void>, mgrReady?: (app: App) => Promise<void>, exclude?: Function[]) {
        mgr = new MgrFactory();
        exclude && mgr.exclude(exclude);
        mgr.once(MgrFactory.Event.Loaded, async () => {
            if (mgrLoaded) {
                await mgrLoaded(this);
            } else {
                this.afterMgrLoaded();
            }
        }).once(MgrFactory.Event.Ready, async () => {
            if (mgrReady) {
                await mgrReady(this);
            } else {
                await this.initKoa();
            }
            this.emit(AppEvent.ready);
        }).loadMgr();
    }

    private afterMgrLoaded() {
        this.initController();
    }

    initController() {
        controllerMgr = mgr.getMgr(ControllerMgr);
        controllerMgr.start();
    }

    async initKoa() {
        const koaApp = new Koa();
        const router = await controllerMgr.koaRouter();
        koaApp.use(async (ctx: Koa.Context, next) => {
            let start = Date.now();
            try {
                await next();
            } catch (err) {
                if (!err.status) {
                    ctx.status = 500;
                } else {
                    ctx.status = err.status;
                    ctx.response.body = err.message;
                }
                let mapUrl = `${ctx.method} ${ctx.path}`;
                logUtil.error(`${mapUrl} 发生错误, header = ${JSON.stringify(ctx.header)}, body = ${JSON.stringify(ctx.request.body)}`, err);
            }
            if (ctx.method && ctx.method.toLowerCase() === 'head') {
                return;
            }
            Tool.debugLog(`${ctx.method} ${ctx.path} cost ${Date.now() - start} ms`);
        })
            .use(bodyParser())
            .use(cors())
            .use(router.routes())
            .use(router.allowedMethods());

        this.server = koaApp.listen(global.port);
        Tool.debugLog(`http server ${global.ip + ':' + global.port} 启动`);
    }

    private handleException() {
        // 进程异常处理
        process.on('uncaughtException', err => {
            logUtil.error('UncaughtException ERROR', err);
            this.close();
        }).on("unhandledRejection", err => {
            logUtil.error("Unhandled Rejection", err);
            this.close();
        });
    }

    private close() {
        try {
            let killTimer = setTimeout(() => {
                process.exit(1);
            }, 30000);
            killTimer.unref();
            if (this.server) {
                this.server.close();
            }
        } catch (e) {
            logUtil.error('error when exit', e);
        }
    }
}
