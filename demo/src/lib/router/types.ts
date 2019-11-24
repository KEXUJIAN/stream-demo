import { Context } from "koa";

export type HttpMethod = "get" | "post";

export enum ReqParmInjectType {
    Query,
    Body,
    Ctx,
    Header
}

export interface ControllerProperty {
    prefix?: string;
    singleton?: boolean
}

export interface MethodProperty {
    path: string;
    name: string;
    httpMethod: HttpMethod[];
    params: string[];
}

export interface ParamsReq {
    required?: boolean;
    /**
     * 入参参数名  
     * 不显示设定则使用函数参数名
     */
    pName?: string;
}

export interface ParamsProperty extends ParamsReq {
    /**
     * 入参的类型, number | string 等
     */
    type?: string;
    /**
     * 入参从哪里获得, header, query string 等
     */
    reqInjectType?: ReqParmInjectType;
    index?: number;
}

export interface HandlerEntity extends MethodProperty {
    paramsInfo: ParamsProperty[];
}

export interface RouterEntity {
    controller?: ControllerProperty;
    handlers?: HandlerEntity[];
}

export interface IEvtRegister {
    evtName: string | symbol;
    handler: Function;
}

export interface RouterPlugin {
    beforeExecHandler(ctx: Context, cls: Function, key: string): Promise<void>;
    evtRegister(): IEvtRegister[];
}
