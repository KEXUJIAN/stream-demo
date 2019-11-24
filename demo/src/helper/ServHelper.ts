import { BaseMgr } from "../mgr/base/BaseMgr";
import { mgr } from "../app/app";
import { Base } from "../service/Base";
import { ServiceMgr } from "../mgr/ServiceMgr";

export class ServHelper {
    static getMgr<T extends BaseMgr>(cls: any): T {
        return mgr.getMgr<T>(cls);
    }

    static getServ<T extends Base>(cls: any, ...args: any[]): T {
        return mgr.getMgr<ServiceMgr>(ServiceMgr).get(cls, ...args);
    }
}