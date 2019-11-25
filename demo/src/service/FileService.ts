import { BaseWithoutDb } from "./Base";
import { Readable } from "stream";
import { randomBytes } from "crypto";
import { Tool } from "../util/Tool";

export class FileService extends BaseWithoutDb {
    download(size: number) {
        return new MyReadable(size);
    }
}

const SPLIT = 1000;

class MyReadable extends Readable {
    size: number;
    upper: number;
    count = 0;
    timer: NodeJS.Timeout;
    destroyed: boolean;

    constructor(size: number) {
        super();
        this.size = size;
        this.upper = Math.floor(size / SPLIT);
    }

    _destroy() {
        this.listenerCount('pipe') && this.unpipe();
        this.timer && clearTimeout(this.timer);
    }

    _read() {
        if (this.count === this.upper) {
            Tool.debugLog(`${this.count}: 数据传输完毕`);
            let size = this.size - this.count * SPLIT;
            size && this.push('1'.repeat(size));
            return this.push(null);
        }
        this.push(this.count + " " + randomBytes(SPLIT / 2).toString('hex').slice(0, -3) + "\n");
        this.count++;
        this.readable = false;
        this.timer = setTimeout(() => {
            this.readable = true;
            this._read();
        }, Math.floor(Math.random() * 0.5 + 1.5) * 1000);
    }
}
