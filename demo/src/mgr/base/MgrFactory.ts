import * as fs from "fs";
import { join } from "path";
import { BaseMgr } from "./BaseMgr";
import { EventEmitter } from "events";
import { Tool } from "../../util/Tool";
import { logUtil } from "../../lib/LogUtil";

export class MgrFactory extends EventEmitter {

    private _exclude: any = {};
    private _hash: any = {};
    private _flag: number = 0;
    static readonly Event = {
        Ready: 'ready',
        Loaded: 'loaded',
    }

    async loadMgr() {
        const dir = join(__dirname, '/../');
        const files = await fs.promises.readdir(dir);
        files.forEach(file => {
            if (!file.endsWith('.js')) {
                return;
            }
            const exporter = require(dir + file);
            Object.keys(exporter).forEach(key => {
                if (Object.getPrototypeOf(exporter[key]) !== BaseMgr) {
                    return;
                }
                const name = Tool.getClsName(exporter[key]);
                if (this._exclude[name]) {
                    return;
                }
                const cls: BaseMgr = new exporter[key]();
                this._hash[name] = cls;
                ++this._flag;
                cls.once(exporter[key].Event.Ready, this.initMgrComplete.bind(this, name));
            });
        });
        Object.keys(this._hash).forEach(key => {
            const obj: BaseMgr = this._hash[key];
            if (obj.autoStart) {
                obj.start().catch(error => {
                    logUtil.error(`${key} start failed`, error);
                });
            }
        });
        delete this._exclude;
        this.emit(MgrFactory.Event.Loaded);
    }

    exclude(cls: any) {
        if (!this._exclude) {
            return;
        }
        if (!Array.isArray(cls)) {
            cls = [cls];
        }
        cls.forEach((mgr: any) => {
            const name = Tool.getClsName(mgr);
            if (!this._exclude[name]) {
                this._exclude[name] = true;
            }
        });
        return this;
    }

    private initMgrComplete(name: string) {
        Tool.debugLog(`mgr[${name}] started`);
        if (--this._flag === 0) {
            this.removeAllListeners(MgrFactory.Event.Loaded);
            this.emit(MgrFactory.Event.Ready);
        }
    }

    getMgr<T>(cls: any): T {
        let name = Tool.getClsName(cls);
        if (!this._hash[name]) {
            throw new Error(`Manager '${name}' 不存在`);
        }
        return this._hash[name];
    }
}