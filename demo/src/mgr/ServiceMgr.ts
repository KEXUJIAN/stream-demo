import { BaseMgr } from "./base/BaseMgr";
import { join } from "path";
import { Tool } from "../util/Tool";
import { Base } from "../service/Base";

const dir = join(__dirname, '/../service/');
export class ServiceMgr extends BaseMgr {
    autoStart = true;
    private container: { [key: string]: serviceObj } = {};
    async start() {
        const loopFn = (filePath: string) => {
            if (filePath.endsWith('Base.js')) {
                return;
            }
            const exporter = require(filePath);
            for (let key in exporter) {
                const cls = exporter[key];
                if (!Tool.targetIsCls(cls, Base)) {
                    continue;
                }
                Tool.debugLog(`import service ${key} from ${filePath}`);
                this.loadService(cls);
            }
        };
        await Tool.readJsFile(dir, loopFn);
        this.emit(BaseMgr.Event.Ready);
    }

    get<T>(cls: any, ...args: any[]): T {
        const name = Tool.getClsName(cls);
        if (!this.container[name]) {
            throw new Error(`Service ${name} 不存在`);
        }
        if (this.container[name].singleton) {
            return this.container[name].service
        }
        return new this.container[name].service(...args);
    }

    private loadService(cls: any) {
        const name = Tool.getClsName(cls);
        let service = cls;
        let singleton = cls.singleton;
        if (singleton) {
            service = new cls();
        }
        this.container[name] = {
            singleton,
            service
        };
    }
}

interface serviceObj {
    singleton: boolean;
    service: any;
}
