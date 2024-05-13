const puppeteer = require("puppeteer");
const { delay } = require("bluebird");
const ms = require("ms");
const path = require("path");
var log = require("single-line-log").stdout;
const { createPuppeteer } = require("../../utils/createPuppeteer");
const folderPath = path.resolve(__dirname, "cache");
const lacalPath = path.join(folderPath, "notFollow-result.json");

const notFollowData = require(lacalPath) || [];

run();

async function run() {
  try {
    if (notFollowData.length === 0) {
      return;
    }
    const { browser, page } = await createPuppeteer();

    await walk(0, notFollowData.length - 1);

    async function walk(curIdx, max) {
      if (curIdx > max) {
        return;
      }

      const cur = notFollowData[curIdx];

      const pattern = /^https:\/\/www\.douyin\.com\/user\/.+$/;

      if (!pattern.test(cur.homeUrl)) {
        console.log("链接不符合格式❌", cur);
        await walk(curIdx + 1, max);
        return;
      }

      await page.goto(cur.homeUrl);
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
        const fensiText = fsEl.textContent;
        if (
          fensiText &&
          (fensiText.includes("万") || fensiText.includes("亿"))
        ) {
          return nameEl.textContent + "," + fensiText + ",大网红，不删除❌";
        } else {
          // 已关注按钮
          const el = document.querySelector(
            ".ZBejQ5yK.WXPQLGYI.UNy4jPPO.ajC8cNxV.I4tJiW0Q.EE_LhMCF"
          );
          el && el.click();
          return nameEl.textContent + "已移除✅" + "," + fensiText;
        }
      }, {});
      console.log(msg, Date.now());
      await delay(ms("1s"));
      await walk(curIdx + 1, max);
    }

    // await browser.close();

    process.exit();
  } catch (error) {
    log("浏览器问题: ");
  }
}
