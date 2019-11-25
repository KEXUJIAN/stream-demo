import request = require("request");

const url = 'http://127.0.0.1:3200/download/v4';
/** 由于设置了 timeout, 导致 1s 后断开（下载未完成就算超时） */
function download() {
    console.log('开始下载');
    let label = "download";
    console.time(label)
    request.get(url, {
        timeout: 1000
    }, (err, res) => {
        if (err) {
            console.log('发生错误', err);
        } else {
            console.log('下载完毕', res.body);
        }
        console.timeEnd(label)
    });
}

async function downloadV2() {
    let timeout = 30;
    let r = request.get(url, { timeout: 0 });
    console.time("getResponse");
    r.on("response", res => {
        console.timeEnd("getResponse");
        timeout = 0;
        res.pipe(process.stdout);
    });
    setTimeout(() => {
        if (timeout) {
            console.log('超时了')
            r.abort();
            r.destroy();
        }
    }, timeout)
}

download();
downloadV2();