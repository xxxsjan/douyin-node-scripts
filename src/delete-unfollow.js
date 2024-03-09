const puppeteer = require("puppeteer");
const { delay } = require("bluebird");
const ms = require("ms");

const fs = require("fs");
var log = require("single-line-log").stdout;
const path = require("path");

const { getWsUrl } = require("../utils");

(async () => {
  await run();
})();
async function run() {
  try {
    const unfollowData = require("../cache/unfollow-result.json") || [];

    if (unfollowData.length === 0) {
      return;
    }

    const browser = await puppeteer.connect({
      browserWSEndpoint: getWsUrl(),
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });

    await walk(0, unfollowData.length - 1);

    async function walk(curIdx, max) {
      if (curIdx > max) {
        return;
      }

      const cur = unfollowData[curIdx];

      const pattern = /^https:\/\/www\.douyin\.com\/user\/.+$/;

      if (!pattern.test(cur.link)) {
        console.log("链接不符合格式❌", cur);
        await walk(curIdx + 1, max);
        return;
      }

      await page.goto(cur.link);
      await page.waitForSelector(".ty_H89Vr");

      const msg = await page.evaluate(({}) => {
        // 粉丝数
        const fsEl = document.querySelector(
          '.WetwxGAE[data-e2e="user-info-like"] .sCnO6dhe'
        );
        // 昵称
        const nameEl = document.querySelector(
          ".ds1zWG9C .j5WZzJdp span span span span"
        );
        if (
          fsEl.textContent &&
          (fsEl.textContent.includes("万") || fsEl.textContent.includes("亿"))
        ) {
          return (
            nameEl.textContent + "," + fsEl.textContent + ",大网红，不删除❌"
          );
        } else {
          // 已关注按钮
          const el = document.querySelector(
            ".ZBejQ5yK.WXPQLGYI.UNy4jPPO.ajC8cNxV.I4tJiW0Q.EE_LhMCF"
          );
          el && el.click();
          return nameEl.textContent + "已移除✅";
        }
      }, {});
      console.log(msg, Date.now());
      await delay(ms("1s"));
      await walk(curIdx + 1, max);
    }

    // await browser.close();

    process.exit();
  } catch (error) {
    log("error: ", error);
  }
}
