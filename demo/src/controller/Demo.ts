import { Route } from "../lib/router/annotations/Decorator";
import { BaseCtxController } from "../lib/BaseController";
import * as fs from 'fs';
import { Tool } from "../util/Tool";
import { FwFile } from "../util/File";
import { randomBytes } from "crypto";
import { ServHelper } from "../helper/ServHelper";
import { FileService } from "../service/FileService";

@Route.Controller({ prefix: '/' })
export class Download extends BaseCtxController {

    @Route.Get()
    async mem() {
        return Tool.memUsage();
    }

    @Route.Get()
    async index() {
        let file = await fs.promises.open(
            '/Users/administrator/workspace/code/stream-demo/demo/temp/demo2.txt',
            'r'
        );
        let a = [];
        let b = [];
        let start = Date.now()
        for (let i = 0; i < 100; i++) {
            fs.read(file.fd, Buffer.alloc(1), 0, 1, null, (e, num, data) => {
                a[i] = i + " " + data.toString() + " " + (Date.now() - start);
                b.push(a[i]);
            });
        }
        let timer = setInterval(() => {
            if (a.length === 100 && a.every(v => typeof v === 'string')) {
                clearInterval(timer);
                console.log(a.filter((v, i) => v !== b[i]));
                file.close();
            }
        }, 10);
        return 'hello';
    }

    /**
     * 通过 stream 下载, 立即返回文件流
     */
    @Route.ReqMapping(['get', 'post'], 'download/v1')
    async downloadV1() {
        let filename = 'demo.txt';
        let fileState = await Tool.getTempFileState(filename);
        return new FwFile(fs.createReadStream(fileState.path), filename, fileState.size);
    }

    /**
     * 通过 stream 下载, 模拟需要长时间 (demo 中为 5 s) 准备文件流
     */
    @Route.ReqMapping(['get', 'post'], 'download/v2')
    async downloadV2() {
        await Tool.sleep(5000);
        return this.downloadV1();
    }

    /**
     * 通过 stream 下载, 快速返回 readable 流, 但数据慢慢准备
     */
    @Route.ReqMapping(['get', 'post'], 'download/v3')
    async downloadV3() {
        let size = Math.floor(Math.random() * 123000 + 1500);
        let filename = 'file' + randomBytes(2).toString('hex') + '.txt';
        Tool.debugLog(`filename = ${filename}, size = ${size} B`)
        return new FwFile(ServHelper.getServ<FileService>(FileService).download(size), filename, size);
    }
}
