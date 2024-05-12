const { createPuppeteer } = require("../packages/utils");
const { delay } = require("bluebird");
const ms = require("ms");

(async function () {
  const { page } = await createPuppeteer();

  await page.goto("https://live.douyin.com/243107977808");

  const voiceBtn = await page
    .waitForSelector(".mLnbv9qu.pmBw8k1t  .ZblGNktR2", { timeout: 5000 })
    .catch((err) => {
      console.log("err: ", err);
    });

  await delay(ms("1s"));
  voiceBtn.click();
})();
