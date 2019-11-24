import { Readable } from "stream";
import { Stats } from "fs";

export class FwFile {
    size: number;
    filename: string;
    readStream: Readable;

    constructor(readStream: Readable, filename: string, size: number) {
        this.size = size;
        this.filename = filename;
        this.readStream = readStream;
    }
}

export interface FileStat extends Stats {
    /** 路径a */
    path: string;
}