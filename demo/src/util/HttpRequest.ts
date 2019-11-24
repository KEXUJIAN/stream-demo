import request = require("request");
import qs = require("querystring");

export interface HttpRequestRet {
    /**
     * 请求错误
     */
    error?: any;
    /**
     * 请求响应数据
     */
    data?: any;
    /**
     * 响应对象
     */
    resp: request.Response;
}

export class HttpRequest {
    static defaultOpt: request.CoreOptions = {
        timeout: 6000
    }

    static async get(url: string, opt?: request.CoreOptions): Promise<HttpRequestRet> {
        return new Promise(resolve => {
            request.get(url, Object.assign({}, this.defaultOpt, opt), this.getResp(resolve, opt));
        });
    }

    static async post(url: string, opt?: request.CoreOptions): Promise<HttpRequestRet> {
        return new Promise(resolve => {
            request.post(url, Object.assign({}, this.defaultOpt, opt), this.getResp(resolve, opt));
        })
    }

    private static getResp(resolve: Function, opt?: request.CoreOptions) {
        return (error: any, resp: request.Response, body: any) => {
            let ret: HttpRequestRet = { resp };
            if (error) {
                ret.error = error;
                return resolve(ret);
            }
            // 大于等于 400 的返回码认为请求失败
            if (resp.statusCode >= 400) {
                ret.error = new Error(`response code = ${resp.statusCode}`);
                return resolve(this.parseResp(ret, resp, body));
            }
            resolve(this.parseResp(ret, resp, body));
        }
    }

    private static parseResp(ret: HttpRequestRet, resp: request.Response, body: any) {
        ret.data = body;
        if (typeof body !== 'string' || !resp.headers['content-type']) {
            return ret;
        }
        try {
            if (resp.headers['content-type'].startsWith("application/x-www-form-urlencoded")) {
                ret.data = qs.parse(body);
            } else if (resp.headers['content-type'].startsWith("application/json")) {
                ret.data = JSON.parse(body);
            }
        } catch (err) {
            ret.error = err;
        }
        return ret;
    }
}
