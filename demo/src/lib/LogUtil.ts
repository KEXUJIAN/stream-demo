import * as log4js from "log4js";
import { LogCfg } from "./LogConfig";
import { iApp } from "../entity/BaseEntity";

declare var global: iApp;
class LogUtil {
    private resLogger: log4js.Logger;
    private sqlLogger: log4js.Logger;
    private exceptionLogger: log4js.Logger;
    private actionLogger: log4js.Logger;
    private dumpLogger: log4js.Logger;

    constructor() {
        this.init();
    }

    init() {
        log4js.configure(LogCfg);
        this.resLogger = log4js.getLogger('resLogger');
        this.sqlLogger = log4js.getLogger('sqlLogger');
        this.exceptionLogger = log4js.getLogger('exceptionLogger');
        this.actionLogger = log4js.getLogger('actionLogger');
        this.dumpLogger = log4js.getLogger('dumpLogger');
    }

    info(msg: string, ctx: any = "") {
        this.resLogger.info(msg, ctx);
    }

    error(msg: string, ctx: any = "") {
        this.exceptionLogger.error(msg, ctx);
    }

    sql(res: any) {
        if (res.cost_time > 300) {
            this.sqlLogger.warn(`${res.sql_text} 执行时间[${res.cost_time}]毫秒`);
        }
        if (global.Debug) {
            this.sqlLogger.info(`${res.sql_text} 执行时间[${res.cost_time}]毫秒`);
        }
    }

    action(playerId: number, action: string, content: any) {
        this.actionLogger.info(`[playerId: ${playerId}]--${action}:${content ? JSON.stringify(content) : ""}`);
    }

    dump(playerId: number, msg: string) {
        this.dumpLogger.info(`[playerId: ${playerId}] -- ${msg}`);
    }
}

export let logUtil = new LogUtil();
