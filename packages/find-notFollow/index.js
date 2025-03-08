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

  const fansDom = await page.waitForSelector(".Q1A_pjwq .C1cxu0Vq"); // 粉丝

  const followCountDom = ".C1cxu0Vq"; // 粉丝数
  const followCount = await page.$eval(followCountDom, (el) => el.innerHTML);
  console.log("followCount: ", followCount);

  const maxNum = Number(followCount);

  fansDom.click();

  //  列表容器
  const selectors = {
    parentSelector: ".FjupSA6k[data-e2e='user-fans-container']",
    childSelector: ".i5U4dMnB",
    nicknameSelector: ".i5U4dMnB .kUKK9Qal .arnSiSbK > span",
    statusSelector: ".i5U4dMnB .HrvFYsXO.qiKy46zD  button> span> .zPZJ3j40",
    homeUrlSelector: ".i5U4dMnB .umh5JQVJ > a.uz1VJwFY",
    liveUrlSelector: ".i5U4dMnB .umh5JQVJ >.oCYLk3Bi > a.uz1VJwFY",
  };

  await page.waitForSelector(selectors.parentSelector);

  let data = {};
  let isFoot = false;
  while (!isFoot) {
    const _data = await page.evaluate(
      ({
        maxNum,
        parentSelector,
        childSelector,
        nicknameSelector,
        statusSelector,
        homeUrlSelector,
        liveUrlSelector,
      }) => {
        const w = document.querySelector(parentSelector);

        const { scrollTop, scrollHeight, clientHeight } = w;

        const elements = document.querySelectorAll(childSelector);

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
            const nickname =
              element.querySelector(nicknameSelector).textContent;

            const status = element.querySelector(statusSelector).textContent;

            const homeUrlEl = element.querySelector(homeUrlSelector);

            const liveEl = element.querySelector(liveUrlSelector);

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
        ...selectors,
      }
    );

    await delay(ms("1s"));
    if (_data.isFoot) {
      isFoot = true;
      data = _data;
    }
    console.log("🚀:", `${_data.renderNum} / ${followCount}`, maxNum);
  }

  if (data.curData) {
    db.set("all", data.curData).write();
  }

  // await browser.close();
  process.exit();
}
