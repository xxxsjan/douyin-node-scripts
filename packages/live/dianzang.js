const pc = require("picocolors");
const { delay } = require("bluebird");
const ms = require("ms");
const fs = require("fs");
const path = require("path");

const { createPuppeteer } = require("utils");

(async function () {
  await run();
})();
async function run() {
  try {
    const { page } = await createPuppeteer();

    await page.goto("https://live.douyin.com/756267652448");

    await page.waitForSelector(".HebThE2z");
    // const viewport = page.viewport();

    // let i = 0;
    // while (i < 40) {
    //   console.log(i, viewport.width / 2, viewport.height / 2);
    //   await delay(ms("1s"));
    //   await page.mouse.click(viewport.width / 2, viewport.height / 2);
    //   i++;
    // }
  } catch (error) {
    console.log("live error", pc.bgRed(error));
  }
}
