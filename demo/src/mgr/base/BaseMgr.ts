import { EventEmitter } from "events";

export abstract class BaseMgr extends EventEmitter {
    static readonly Event = {
        Ready: 'ready.mgr'
    };
    protected ready = false;
    autoStart = false;
    abstract async start(...args: any[]): Promise<void>;
}