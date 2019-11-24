import { iApp, IConfig } from "../entity/BaseEntity";
import { Configuration, PatternLayout } from "log4js";
import path = require('path');

declare var global: iApp;

let config_path = 'config_' + (process.env.NODE_ENV || "dev") + '.json';
let config: IConfig = require(path.join(__dirname, '/../' + config_path));
global.port = config.port;

//错误日志输出完整路径
let errorLogPath = path.resolve(__dirname, "../logs/error/error.log");

//响应日志输出完整路径
let outLogPath = path.resolve(__dirname, "../logs/out/out.log");

//逻辑异常输出完整路径
let excepitonLogPath = path.resolve(__dirname, "../logs/error/err.log");

const gameLog = "/opt/logs/stream-demo/";
//同步odps日志输出完整路径
let odpsLogPath = path.resolve(__dirname, gameLog + global.port + "/odps/odps.log");

//dump日志输出完整路径
let dumpLogPath = path.resolve(__dirname, gameLog + global.port + "/dump/dump.log");
//sql日志输出完整路径
let sqlLogPath = path.resolve(__dirname, gameLog + global.port + "/sql/sql.log");
//action日志输出完整路径
var actionLogPath = path.resolve(__dirname, gameLog + global.port + "/action/action.log");

const dateFile = '.yyyy-MM-dd';
const basePattern: PatternLayout = {
    type: 'pattern',
    pattern: '[%d] [%p] [%z] %c - %m'
};

export const LogCfg: Configuration = {
    appenders: {
        access: {
            type: 'dateFile',
            filename: outLogPath,
            pattern: '.yyyy-MM-dd-hh',
            alwaysIncludePattern: true,
            layout: basePattern,
            keepFileExt: true,
        },
        excepitonFile: {
            type: 'dateFile',
            filename: excepitonLogPath,
            pattern: dateFile,
            alwaysIncludePattern: true,
            layout: basePattern,
            keepFileExt: true,
        },
        odps: {
            type: 'dateFile',
            filename: odpsLogPath,
            pattern: dateFile,
            alwaysIncludePattern: true,
            layout: { type: 'messagePassThrough' },
            keepFileExt: true,
        },
        dump: {
            type: 'dateFile',
            filename: dumpLogPath,
            pattern: dateFile,
            alwaysIncludePattern: true,
            layout: basePattern,
            keepFileExt: true,
        },
        sql: {
            type: 'dateFile',
            filename: sqlLogPath,
            pattern: dateFile,
            alwaysIncludePattern: true,
            layout: basePattern,
            keepFileExt: true,
        },
        action: {
            type: 'dateFile',
            filename: actionLogPath,
            pattern: dateFile,
            alwaysIncludePattern: true,
            layout: basePattern,
            keepFileExt: true,
        },
    },
    categories: {
        default: { appenders: ['access'], level: 'all' },
        resLogger: { appenders: ['access'], level: 'all' },
        exceptionLogger: { appenders: ['excepitonFile'], level: 'all' },
        odpsLogger: { appenders: ['odps'], level: 'info' },
        dumpLogger: { appenders: ['dump'], level: 'info' },
        sqlLogger: { appenders: ['sql'], level: 'info' },
        actionLogger: { appenders: ["action"], level: 'info' },
    }
}