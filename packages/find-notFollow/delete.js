const { delay } = require("bluebird");
const ms = require("ms");
var log = require("single-line-log").stdout;

const { initDb } = require("./db");
const { createPuppeteer, pclog } = require("utils");

const db = initDb();
const notFollowData = db.get("notFollowList").value();

run();

async function run() {
  try {
    if (notFollowData.length === 0) {
      return;
    }
    const { page } = await createPuppeteer();

    await walk(0, notFollowData.length - 1);

    async function walk(curIdx, max) {
      if (curIdx > max) {
        return;
      }

      const cur = notFollowData[curIdx];

      if (!cur.homeUrl) {
        console.log("链接不符合格式❌", cur.nickname);
        await walk(curIdx + 1, max);
        return;
      }

      await page.goto(cur.homeUrl);
      await page.waitForSelector(".ty_H89Vr");

      const msg = await page.evaluate(() => {
        // 粉丝数
        const fsEl = document.querySelector(
          '.WetwxGAE[data-e2e="user-info-fans"] .sCnO6dhe'
        );
        // 昵称
        const nameEl = document.querySelector(
          ".ds1zWG9C .j5WZzJdp span span span span"
        );
        // 关注
        const followEl = document.querySelector(
          '.WetwxGAE[data-e2e="user-info-follow"] .sCnO6dhe'
        );

        const username = nameEl.textContent;
        const fensiText = fsEl ? fsEl.textContent : "";
        const followText = followEl ? followEl.textContent : "";

        if (
          fensiText &&
          (fensiText.includes("万") || fensiText.includes("亿"))
        ) {
          return `✅ ${username} ${fensiText}大网红，不删除`;
        } else {
          const followNum = parseFloat(followText);
          const fensiNum = parseFloat(fensiText);
          if (followNum < fensiNum / 10) {
            // 已关注按钮
            // const el = document.querySelector(
            //   ".ZBejQ5yK.WXPQLGYI.UNy4jPPO.ajC8cNxV.I4tJiW0Q.EE_LhMCF"
            // );
            // el && el.click();
            return `❌ ${username} [${followText} ${fensiText}] 已移除 `;
          } else {
            return `✅ ${username} [${followText} ${fensiText}] 符合互关条件，不删除`;
          }
        }
      });

      console.log(getCurrentTime(), msg);

      await delay(ms("1s"));

      await walk(curIdx + 1, max);
    }

    // await browser.close();

    process.exit();
  } catch (error) {
    log("浏览器问题: ");
  }
}
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString();
}
