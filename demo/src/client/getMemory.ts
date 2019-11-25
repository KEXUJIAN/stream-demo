import { Tool } from "../util/Tool";
let a = []
for (let i = 0; i < 5; i++) {
    console.log(Tool.memUsage(`第 ${i} 次申请前`));
    a.push(Buffer.alloc(1024 * 1024 * 1024));
    console.log(Tool.memUsage(`第 ${i} 次申请后`));
}