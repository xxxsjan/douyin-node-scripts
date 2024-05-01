const { roomIdData } = require("./roomid");

const { delay } = require("bluebird");
const ms = require("ms");

var log = require("single-line-log").stdout;

const { createPuppeteer } = require("../../utils/createPuppeteer");
const { randomNum } = require("../../utils");

run();

async function run() {
  try {
    const { page } = await createPuppeteer();

    const len = roomIdData.length;
    let i = 0;

    // 获取当前时分秒
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const timestamp = now.getTime();
    const startTime = timestamp;

    const startTimeText = `${hours}:${minutes}:${seconds}`;

    async function walk() {
      while (i < len) {
        const { live_id, url } = roomIdData[i];
        if (live_id) {
          await page.goto(url);
        }
        await delay(ms(randomNum(8, 15) + "s"));

        const endTime = Date.now();
        let costTime = endTime - startTime;
        costTime = costTime / 1000;
        const logArr = [
          live_id,
          `开始时间：${startTimeText}`,
          `耗时: ${costTime}秒`,
          `当前第${i + 1}个`,
          `总共有${len}个`,
        ];
        console.log(logArr.join("--"));

        i++;
        await walk();
      }
    }
    await walk();

    process.exit();
  } catch (error) {
    log("error: ", error);
  }
}
