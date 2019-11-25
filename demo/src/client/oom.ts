import { Tool } from "../util/Tool";
import { readFileSync } from "fs";
import { join } from "path";
import { ROOT } from "../entity/BaseEntity";
for (let i = 0; i < 2; i++) {
    console.log(Tool.memUsage(`第 ${i} 次读取前`));
    readFileSync(join(ROOT, '/temp/largefile.zip'), 'utf-8');
    console.log(Tool.memUsage(`第 ${i} 次读取后`));
}