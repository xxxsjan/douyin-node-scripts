const { delay } = require("bluebird");
const ms = require("ms");
const fs = require("fs");
// var log = require("single-line-log").stdout;
const path = require("path");

const { createPuppeteer, pclog } = require("utils");
const { initDb } = require("./db");

const db = initDb();

run();

async function run() {
  const { page } = await createPuppeteer();

  await page.goto("https://www.douyin.com/user/self");

  const fansDom = await page.waitForSelector(".WetwxGAE.GQQEtJnJ");

  const followCountDom = ".sCnO6dhe";
  const followCount = await page.$eval(followCountDom, (el) => el.innerHTML);

  const maxNum = Number(followCount);

  fansDom.click();

  //  列表容器
  await page.waitForSelector('.eq0kzn5a[data-e2e="user-fans-container');

  let data = {};
  let isFoot = false;
  while (!isFoot) {
    const _data = await page.evaluate(
      ({ maxNum, selector }) => {
        const w = document.querySelector(
          '.eq0kzn5a[data-e2e="user-fans-container'
        );

        const { scrollTop, scrollHeight, clientHeight } = w;

        const elements = document.querySelectorAll(".QxZvDLx8");

        const renderNum = elements.length;

        console.log("当前渲染个数：", renderNum);

        let top = w.scrollHeight - w.clientHeight + 10;

        const result = {
          scrollTop,
          scrollHeight,
          clientHeight,
          renderNum,
        };

        if (renderNum >= maxNum) {
          const curData = [];
          elements.forEach((element) => {
            // .QxZvDLx8 .iAqs9BfT .frvzAIi8 a.hY8lWHgA 直播中
            // .QxZvDLx8 .iAqs9BfT a.hY8lWHgA
            const nickname =
              element.querySelector(".j5WZzJdp > span").textContent;

            const status = element.querySelector(
              ".DrgO6Dle .mqZgWvzs"
            ).textContent;

            const homeUrlEl = element.querySelector(".iAqs9BfT > a.hY8lWHgA");

            const liveEl = element.querySelector(
              ".iAqs9BfT > .frvzAIi8 > a.hY8lWHgA"
            );

            curData.push({
              nickname, // 昵称
              status, // 关注状态
              homeUrl: homeUrlEl ? homeUrlEl.href : "",
              liveUrl: liveEl ? liveEl.href : "",
            });
          });
          return { ...result, isFoot: true, curData };
        }
        w.scrollTo(0, top);
        return { ...result, isFoot: false };
      },
      {
        // maxNum: 123,
        maxNum, // 最大显示个数，参考关注数
      }
    );

    await delay(ms("1s"));
    if (_data.isFoot) {
      isFoot = true;
      data = _data;
    }
    console.log("🚀  :", _data.renderNum, followCount, maxNum);
  }

  if (data.curData) {
    db.set("all", data.curData).write();
  }

  // await browser.close();
  process.exit();
}
