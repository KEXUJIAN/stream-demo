import { Context } from "koa";

export class BaseController {

}

export class BaseCtxController extends BaseController {
    ctx: Context;
}