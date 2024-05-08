const pc = require("picocolors");
const { delay } = require("bluebird");
const ms = require("ms");

const { createPuppeteer } = require("../../utils/createPuppeteer");
const { randomNum } = require("../../utils");
const { getTodoUrls } = require("./getTodoUrls");

const roomIdData = getTodoUrls();
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
        const { live_id, url, type } = roomIdData[i];

        if (type === "live_room") {
          await page.goto(url);

          // 等待随机延迟，最短8秒，最长15秒
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

          console.log(pc.green(logArr.join("--")));
        } else {
          // 主页
        }
        i++;
        await walk();
      }
    }
    await walk();

    process.exit();
  } catch (error) {
    console.log("live error", pc.bgRed(error));
  }
}
