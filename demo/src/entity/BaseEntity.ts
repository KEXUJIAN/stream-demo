import global = NodeJS.Global;
import { join } from "path";

export const PROJECT = join(__dirname, '../');
export const ROOT = join(PROJECT, '../');

export interface iApp extends global {
    Debug: boolean;
    DBManager: {
        ip: string,
        port: number,
        select: number,
        flag: {
            auth_pass: string
        }
    };
    mysql: {
        connectionLimit: number,
        host: string,
        port: number,
        user: string,
        password: string,
        database: string,
    };
    platServer: any;
    ip: string;
    port: number;
    plat: number;
    gameId: number;
}

export interface IConfig {
    debug: boolean;
    port: number;
    plat: number;
    gameId: number;
    DBManager: {
        ip: string;
        port: number;
        select: number;
        flag: {
            auth_pass: string;
        }
    };
    platServer: any;
    mysql: {
        connectionLimit: number,
        host: string,
        port: number,
        user: string,
        password: string,
        database: string
    };
    version: string;
}

export class HttpError extends Error {
    status: number;
    constructor(status: number, message: any = "") {
        super();
        this.status = status;
        this.message = message;
    }
}

export enum BaseConst {
    Auth_Token = "Wpxss-Token-Header",
}

export class BaseResp {
    success: boolean;
    code: string | number;
    msg: string;
    data: any;
    constructor(success: boolean, code: string | number, msg?: string, data?: any) {
        this.success = success;
        this.code = code;
        this.msg = msg || getErrMsg(code);
        this.data = data;
    }

    setData<T>(data: T) {
        this.data = data;
        return this;
    }
}

export class BaseRespError extends HttpError {
    constructor(code: string | number, message?: string) {
        super(200, new BaseResp(false, code, message));
    }
}

export interface IReward {
    id: string,
    num: number
}

export const enum RedisKey {
    DataSync = "DS",
    PlatUserToken = "PUT",
    DataSyncList = "DSL",
}

export const enum LoginMode {
    Online,
    test
}

export enum CusErrCode {
    Success = 0,
    Code_0 = "成功",
    PlatError = 1000,
    Code_1000 = "请求平台服失败",
    PlatAuthFail = 1001,
    Code_1001 = "平台用户验证失败"
};

function getErrMsg(code: number | string) {
    return CusErrCode[`Code_${code}`] || "";
}