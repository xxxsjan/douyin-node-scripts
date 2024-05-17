const pc = require("picocolors");
const { delay } = require("bluebird");
const ms = require("ms");
const fs = require("fs");
const path = require("path");

const { createPuppeteer, pclog, createCwdCacheFile } = require("utils");

const { getTodoUrls } = require("./getTodoUrls");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const roomIdData = getTodoUrls();

const db = initDb();

(async function () {
  await run();
})();

function initDb() {
  const dbPath = createCwdCacheFile(`db-${getTodayDateString()}.json`);

  const adapter = new FileSync(dbPath);
  const db = low(adapter);

  db.defaults({ hadView: [], notLive: [] }).write();

  const dataTime = db.get("date").value() || 0;

  if (!isSameDay(new Date(), new Date(dataTime))) {
    db.set("date", new Date().getTime()).write();
    db.set("hadView", []).write();
    db.set("notLive", []).write();
  }
  pclog.green("db 初始化完成");
  return db;
}

function saveNotLive(data) {
  const notLive = db.get("notLive").value();

  if (!notLive.find((f) => f.username == data.name)) {
    db.get("notLive").push(data).write();
  }
}

function saveHadView(data) {
  db.get("hadView").push(data).write();
  const _data = db.get("hadView").value();

  console.log(
    pc.white(`[${getCurrentTime()}]`),
    pc.green(` ${data.username} 已观看:${_data.length}`)
  );
}

async function run() {
  const { page } = await createPuppeteer();
  const len = roomIdData.length;
  let i = 0;
  const hadView = db.get("hadView").value();

  while (i < len) {
    const itemData = roomIdData[i];
    const { live_id, url, type } = itemData;

    if (type === "live_url") {
      if (hadView.find((f) => f.live_id === live_id)) {
        console.log(live_id, "已观看", i, len);
        i++;
        continue;
      } else {
        await handleToLiveRoom(page, {
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
      const _f = hadView.find((f) => f.home_url === url);

      if (_f) {
        console.log(_f.username || _f.live_id, "已观看", i, len);

        i++;
        continue;
      } else {
        // 主页
        await page.goto(url);

        await page.waitForSelector(".BhdsqJgJ").catch(() => {
          errLog("BhdsqJgJ 获取失败");
        });

        const usernameSelector = ".j5WZzJdp span span span span";
        const username = await page
          .$eval(usernameSelector, (el) => el.innerText)
          .catch(() => {
            pclog.red("username error");
          });

        // 父盒子
        await page.waitForSelector(".o1w0tvbC.F3jJ1P9_.InbPGkRv").catch(() => {
          errLog("waitForSelector 父盒子获取失败");
        });

        const livingHref = await page
          .$eval(
            ".o1w0tvbC.F3jJ1P9_.InbPGkRv>.BhdsqJgJ>.frvzAIi8>a",
            (el) => el.href
          )
          .catch(() => {
            pclog.red("主页无live a标签");
          });

        const living = !!livingHref;

        if (living) {
          const pathname = new URL(livingHref).pathname;

          const live_id = pathname.replace("/", "");

          if (hadView.find((f) => f.live_id === live_id)) {
            console.log(live_id, "之前已观看");
            i++;
            continue;
          }

          await handleToLiveRoom(page, {
            live_url: livingHref,
            live_id,
            url,
            living,
            i,
            len,
          });
        } else {
          await delay(ms("1s"));
          saveNotLive({ username, home_url: url });
          logStr({ username, living, i, len });
        }
        i++;
      }
    }
  }
  console.log("done");
}

function logStr({ username = "", living, i, len, waitTime = "" }) {
  const hadView = db.get("hadView").value();
  // const notLive = db.get("notLive").value();
  if (!living) {
    console.log(
      pc.white(`[${getCurrentTime()}]`),
      pc.yellow(`${i + 1}/${len} ${username} 未开播 已观看：${hadView.length}`)
    );
    return;
  } else {
    console.log(
      pc.white(`[${getCurrentTime()}]`),
      pc.green(
        `${i + 1}/${len} ${username} 观看中。。(${waitTime}) 已观看：${
          hadView.length
        }`
      )
    );
  }
}

async function handleToLiveRoom(
  page,
  { live_url, live_id, url, living, i, len }
) {
  await page.goto(live_url);

  const isStop = await page
    .waitForSelector(".J2EmTkWs", { timeout: 4500 })
    .then(() => {
      errLog(live_id + "停播");
      return true;
    })
    .catch(() => {
      return false;
    });
  if (isStop) {
    return;
  }
  await page
    .waitForSelector(".xQl4U2BP.pmBw8k1t .ZblGNktR", { timeout: 3000 })
    .then((btn) => {
      // pclog.green("开启声音");
      // btn.click();
    })
    .catch((err) => pclog.red("无弹出声音开启dom"));

  await delay(ms("1s"));

  await page.waitForSelector(".jpguc9PK a").catch(() => {
    pclog.red("等待.jpguc9PK a元素出现时发生错误:");
  });

  const username = await page
    .$eval(".jpguc9PK a", (el) => el.innerText)
    .catch((err) => {
      pclog.red(".jpguc9PK a 获取href失败", err);
    });

  console.log("🚀--直播间 username", username);

  const waitTime = randomNum(6, 10) + "s";

  logStr({ username, living, i, len, waitTime, live_id });
  await delay(ms(waitTime));
  saveHadView({ live_id, username, home_url: url });
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
// 获取今天年月日字符串
function getTodayDateString() {
  const today = new Date();
  return today.toLocaleString().split(" ")[0].replaceAll("/", "-"); // 2024/5/12 00:55:34
}

// 获取当前时分秒
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString();
}
function errLog(text) {
  console.log(pc.red(text));
}
