const puppeteer = require("puppeteer");
const { getWsUrl } = require("./index");

async function createPuppeteer() {
  const browserWSEndpoint = await getWsUrl();
  const browser = await puppeteer.connect({
    browserWSEndpoint,
  }); // 使用debug浏览器
  // const browser = await puppeteer.launch({ headless: false});// 打开浏览器
  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  return {
    browser,
    page,
  };
}

module.exports = { createPuppeteer };
