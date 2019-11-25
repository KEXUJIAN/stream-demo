import { iApp, HttpError, LoginMode, BaseRespError } from "../entity/BaseEntity";
import { networkInterfaces } from "os";
import * as fs from "fs";
import { join } from "path";
import os = require("os");
import { logUtil } from "../lib/LogUtil";
import { FileStat } from "./File";

declare var global: iApp;

export class Tool {
    static debugLog(msg: any) {
        if (global.Debug) {
            var d = new Date();
            console.log(d.toLocaleString() + "." + d.getMilliseconds() + ": " + (typeof msg == "string" ? msg : JSON.stringify(msg)) + "\r\n");
        } else {
            logUtil.info(typeof msg == "string" ? msg : JSON.stringify(msg));
        }
    }

    static targetIsCls(target: any, cls: any) {
        if (!Object.getPrototypeOf(target)) {
            return false;
        }
        if (Object.getPrototypeOf(target) !== cls) {
            return this.targetIsCls(Object.getPrototypeOf(target), cls);
        }
        return true;
    }

    static getClsName(cls: Function) {
        return cls.prototype.constructor.name;
    }

    static async sleep(ms: number) {
        return new Promise<true>(resolve => {
            setTimeout(() => resolve(true), ms);
        });
    }

    static getIPv4() {
        let ipv4 = "";
        let range = ",192,10,172,118";
        let wlan = networkInterfaces();
        let ips: string[] = [];
        for (let i in wlan) {
            let networks = wlan[i];
            for (let network of networks) {
                if (network.family !== 'IPv4') {
                    continue;
                }
                ipv4 = network.address;
                if (range.indexOf(',' + ipv4.substr(0, ipv4.indexOf('.')) + ',') === -1) {
                    continue;
                }
                ips.push(ipv4);
            }
        }
        ipv4 = ips[0];
        return ipv4;
    }

    static throwHE(status: number = 500, message: string = "") {
        throw new HttpError(status, message);
    }

    static throwCE(code: string | number, message?: string) {
        throw new BaseRespError(code, message);
    }

    static memUsage(msg?: string) {
        let tmp = process.memoryUsage();
        let memStr = Object.keys(tmp).map(k => `${k} => ${parseFloat((tmp[k] / 1024 / 1024).toPrecision(12))} MB`).join("\n");
        return (msg ? msg + "\n" : "") + memStr;
    }

    static async readJsFile(dir: string, loopFn?: Function) {
        const fileNames = await fs.promises.readdir(dir);
        let filesPath: string[] = [];
        // 假设只有 `.js`, `.map`, 目录
        for (let i = 0; i < fileNames.length; i++) {
            let fileName = fileNames[i];
            let filePath = join(dir, fileName);
            if (fileName.endsWith('.map') || fileName.startsWith('.')) {
                continue;
            }
            const state = await fs.promises.stat(filePath)
            if (state.isDirectory()) {
                (await fs.promises.readdir(filePath)).forEach(value => {
                    if (value.startsWith('.')) {
                        return;
                    }
                    fileNames.push(`${fileName}/${value}`);
                });
                continue;
            }
            filesPath.push(filePath);
            if (loopFn) {
                await loopFn(filePath);
            }
        }
        return filesPath;
    }

    static isWindows() {
        return os.type().indexOf("Windows") != -1;
    }

    static isDebug() {
        return !!((process.env.NODE_ENV || 'dev') === 'dev');
    }

    static safeParse(value: string) {
        try {
            return JSON.parse(value);
        } catch (error) {
            return null;
        }
    }

    static async getTempFileState(path: string) {
        path = join(__dirname, '../../temp', path);
        try {
            let stat: FileStat = await fs.promises.stat(path) as any;
            stat.path = path;
            return stat;
        } catch (e) {
            return null;
        }
    }
}

export function stringify(key: any) {
    if (typeof key == "string") return key;
    return JSON.stringify(key);
}
