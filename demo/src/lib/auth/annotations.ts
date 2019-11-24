import "reflect-metadata";
import { IAuthUser } from "./types";
import * as Koa from "koa";

declare module "koa" {
    interface Request {
        user: IAuthUser
    }
}
const AuthKey = Symbol('Auth');

export class Auth {
    static OnClass() {
        return (constructor: Function) => {
            // 传递到实例中
            Reflect.defineMetadata(AuthKey, true, constructor.prototype);
        };
    }

    static OnFunc(needAuth: boolean = true) {
        return (target: any, key: string, des: PropertyDescriptor) => {
            Reflect.defineMetadata(AuthKey, needAuth, target, key);
        };
    }

    static getAuthData(target: Function, key?: string) {
        if (key) {
            return Reflect.getMetadata(AuthKey, target, key);
        }
        return Reflect.getMetadata(AuthKey, target);
    }
}
