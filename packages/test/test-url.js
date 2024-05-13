const { createPuppeteer } = require("utils");
const { delay } = require("bluebird");
const ms = require("ms");

(async function () {
  const { page } = await createPuppeteer();

  await page.goto("https://live.douyin.com/243107977808");
})();
