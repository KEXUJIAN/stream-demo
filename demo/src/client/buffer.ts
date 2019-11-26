import { Tool } from "../util/Tool";

let a = [];
for (let i = 0; i < 2; i++) {
    console.time('alloc' + i);
    a.push(Buffer.alloc(1000));
    console.timeEnd('alloc' + i);

    console.time('allocUnsafe' + i);
    a.push(Buffer.allocUnsafe(1000));
    console.timeEnd('allocUnsafe' + i);
}

(async function() {
    console.log('最初', Tool.memUsage());
    let a = []
    await Tool.benchmark('buffer alloc', () => {
        a.push(Buffer.alloc(1024 * 1024 * 100));
    });
    console.log('alloc', Tool.memUsage());
    await Tool.sleep(1000);
    await Tool.benchmark('buffer allocUnsafe', () => {
        a.push(Buffer.allocUnsafe(1024 * 1024 * 100));
    });
    console.log('allocUnsafe', Tool.memUsage());
})()

