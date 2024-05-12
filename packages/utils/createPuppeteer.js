const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const prompts = require("prompts");
const pc = require("picocolors");

async function getWsUrl() {
  console.log("http://127.0.0.1:9222/json/version");
  let cacheData, defaultWs;

  const cachePath = path.resolve(process.cwd(), "config.json");
  console.log("cachePath: ", cachePath);

  if (fs.existsSync(cachePath)) {
    cacheData = fs.readFileSync(cachePath, { encoding: "utf-8" });
    defaultWs = JSON.parse(cacheData).ws;
  }

  try {
    const response = await prompts({
      type: "text",
      name: "ws",
      message: "ws地址",
      initial: defaultWs,
      validate: (value) => {
        if (value && !value.includes("ws://")) {
          return "ws地址格式不正确";
        }
        return true;
      },
    });

    if (!response.ws) {
      console.log(pc.bgRed("ws地址不能为空"));
      return "ws地址不能为空";
    }

    fs.writeFileSync(cachePath, JSON.stringify(response, null, 2), "utf8");
    console.log("已更新ws");

    const wsUrl = response.ws;
    const url = new URL(wsUrl);
    url.searchParams.set("stealth", "true");
    // url.searchParams.set("headLess", "false");
    url.searchParams.set("timeout", "600000");
    url.searchParams.set("--disable-notifications", "true");
    url.searchParams.set("--disable-dev-shm-usage", "true");

    const result = url.toString();

    return result;
  } catch (error) {
    console.log("error: ", error);
  }
}

async function createPuppeteer() {
  try {
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
  } catch (error) {
    console.log("createPuppeteer error: ", error);
  }
}

module.exports = { createPuppeteer };
