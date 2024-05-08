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

    async function walk() {
      while (i < len) {
        const { live_id, url, type } = roomIdData[i];

        if (type === "live_room") {
          await page.goto(url);

          // 等待随机延迟，最短8秒，最长15秒
          const waitTime = randomNum(8, 15) + "s";

          logStr({ username: live_id, living: true, i, len, waitTime });

          await delay(ms(waitTime));
        } else {
          // 主页
          await page.goto(url);

          await page.waitForSelector(".BhdsqJgJ");

          const usernameSelector = ".j5WZzJdp span span span span";
          const username = await page.$eval(
            usernameSelector,
            (el) => el.innerText
          );

          // .BhdsqJgJ .ZgMmtbts 未直播
          // .BhdsqJgJ .KZ_xK377 在直播

          const living = await page.$(".BhdsqJgJ .KZ_xK377");

          if (living) {
            page.waitForSelector(".BhdsqJgJ a.hY8lWHgA");
            const href = await page.$eval(
              ".BhdsqJgJ a.hY8lWHgA",
              (el) => el.href
            );
            await page.goto(href);
            const waitTime = randomNum(8, 15) + "s";

            logStr({ username, living, i, len, waitTime });
            await delay(ms(waitTime));
          } else {
            logStr({ username, living, i, len });
          }
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

function logStr({ username = "", living, i, len, waitTime = "" }) {
  // console.log("username: ", username);
  // username = username || "";
  if (!living) {
    console.log(pc.yellow(`${i + 1}/${len} ${username} 未开播`));
    return;
  } else {
    console.log(
      pc.green(`${i + 1}/${len} ${username} 观看中。。(${waitTime})`)
    );
  }
}

// 时间计时类
class Timer {
  constructor() {
    this.startTime = Date.now();
    this.endTime = 0;
    this.costTime = 0;
    // 获取当前时分秒
    //  const now = new Date();
    //  const hours = now.getHours();
    //  const minutes = now.getMinutes();
    //  const seconds = now.getSeconds();
    //  const timestamp = now.getTime();
    // const startTime = timestamp;
    // const startTimeText = `${hours}:${minutes}:${seconds}`;
    // const endTime = Date.now();
    // let costTime = endTime - startTime;
    // costTime = costTime / 1000;
  }
  start() {
    this.startTime = Date.now();
  }
  end() {
    this.endTime = Date.now();
    this.costTime = this.endTime - this.startTime;
    return this.costTime;
  }
  getCostTime() {
    return this.costTime;
  }
}
