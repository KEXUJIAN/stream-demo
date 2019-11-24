import { Context } from "koa";

export interface IAuth {
    supports(...args: any[]): boolean;
    getCredentials(ctx: Context): Promise<IAuthCredential>;
    loadUser(credentials: IAuthCredential, ...args: any[]): Promise<IAuthUser>;
    onAuthSuccess(ctx: Context, credentials: IAuthCredential, ...args: any[]): Promise<any>;
    onAuthFailure(ctx: Context, ...args: any[]): any;
    genCredential(...args: any[]): Promise<IAuthCredential>;
    refreshCredential(...args: any[]): Promise<boolean>;
}

export interface IAuthUser {
    username: string;
    data?: any
}

export interface IAuthCredential {
    user: IAuthUser;
    expiryAt?: number;
    currentToken?: string;
    nextToken?: string;
}
