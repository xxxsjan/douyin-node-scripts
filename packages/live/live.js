const pc = require("picocolors");
const { delay } = require("bluebird");
const ms = require("ms");
const fs = require("fs");
const path = require("path");

const { createPuppeteer } = require("utils/createPuppeteer");

const { getTodoUrls } = require("./getTodoUrls");

const roomIdData = getTodoUrls();

if (!fs.existsSync(path.resolve(process.cwd(), "./cache"))) {
  fs.mkdirSync(path.resolve(process.cwd(), "./cache"));
}
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const dbPath = path.resolve(process.cwd(), "./cache/db.json");
const adapter = new FileSync(dbPath);
const db = low(adapter);

db.defaults({ hadView: [], notLive: [] }).write();

const dataTime = db.get("date").value() || 0;

if (!isSameDay(new Date(), new Date(dataTime))) {
  db.set("date", new Date().getTime()).write();
  db.set("hadView", []).write();
  db.set("notLive", []).write();
}

const hadView = db.get("hadView").value();

// const notLive = db.get("notLive").value();

function saveNotLive(data) {
  db.get("notLive").push(data).write();
}

function saveHadView(data) {
  db.get("hadView").push(data).write();
  const _data = db.get("hadView").value();
  console.log(data, "已观看", _data.length);
}

(async function () {
  await run();
})();
async function run() {
  try {
    const { page } = await createPuppeteer();
    const len = roomIdData.length;
    let i = 0;

    while (i < len) {
      const itemData = roomIdData[i];
      const { live_id, url, type } = itemData;

      if (type === "live_room") {
        if (hadView.find((f) => f.live_id === live_id)) {
          console.log(live_id, "已观看");
          i++;
          continue;
        } else {
          await await handleToLiveRoom(page, {
            live_url: url,
            live_id,
            url,
            living: true,
            i,
            len,
          });

          i++;
        }
      } else {
        if (hadView.find((f) => f.home_url === url)) {
          console.log(url, "已观看");
          i++;
          continue;
        } else {
          // 主页
          await page.goto(url);
          await page.waitForSelector(".BhdsqJgJ");

          const usernameSelector = ".j5WZzJdp span span span span";
          const username = await page.$eval(
            usernameSelector,
            (el) => el.innerText
          );
          console.log(username);
          // .BhdsqJgJ .ZgMmtbts 未直播
          // .BhdsqJgJ .KZ_xK377 在直播

          const living = await page.$(".BhdsqJgJ .KZ_xK377");

          if (living) {
            page.waitForSelector(".BhdsqJgJ a.hY8lWHgA");
            const href = await page.$eval(
              ".BhdsqJgJ a.hY8lWHgA",
              (el) => el.href
            );
            // console.log(href);
            const pathname = new URL(href).pathname;
            const live_id = pathname.replace("/", "");
            if (hadView.find((f) => f.live_id === live_id)) {
              console.log(live_id, "已观看");
              i++;
              continue;
            }
            await handleToLiveRoom(page, {
              live_url: href,
              live_id,
              url,
              living,
              i,
              len,
            });
          } else {
            saveNotLive({ username, home_url: url });
            logStr({ username, living, i, len });
          }
          i++;
        }
      }
    }

    // process.exit();
  } catch (error) {
    console.log("live error", pc.bgRed(error));
  }
}

function logStr({ username = "", living, i, len, waitTime = "" }) {
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

async function handleToLiveRoom(
  page,
  { live_url, live_id, url, living, i, len }
) {
  await page.goto(live_url);
  await page.waitForSelector(".jpguc9PK a");
  const username = await page.$eval(".jpguc9PK a", (el) => el.innerText);
  saveHadView({ live_id, username, home_url: url });

  console.log("live_id: ", live_id);

  const waitTime = randomNum(8, 15) + "s";

  logStr({ username, living, i, len, waitTime, live_id });
  await delay(ms(waitTime));
}

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
