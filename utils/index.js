const { delay } = require("bluebird");

// 有图片的昵称转成普通的
function strRemoveImg(name) {
  if (!name) return "";
  const res = name.replaceAll(
    /<img.*?alt="(.*?)" src="(.*?)">/g,
    function (...args) {
      return args[1];
    }
  );
  return res;
}
function getWsUrl() {
  const wsUrl = require("../config").ws;
  const url = new URL(wsUrl);
  url.searchParams.set("stealth", "true");
  // url.searchParams.set("headLess", "false");
  url.searchParams.set("timeout", "600000");
  url.searchParams.set("--disable-notifications", "true");
  url.searchParams.set("--disable-dev-shm-usage", "true");
  return url.toString();
}

async function getInfo(page, url) {
  await page.goto(url);
  const userInfo = {
    home: url,
  };
  const selector = {
    nickName: ".xpjM3LEg .Nu66P_ba span span span span",
    uid: ".aH7rLkZZ",
    followNum: "div[data-e2e=user-info-follow] .TxoC9G6_",
    fansNum: "div[data-e2e=user-info-fans] .TxoC9G6_",
    tabCount: 'span[data-e2e="user-tab-count"]',
  };
  await page.waitForSelector(selector.nickName);
  userInfo.nickName = await page.$eval(selector.nickName, (el) => el.innerHTML);
  userInfo.uid = await page.$eval(selector.uid, (el) => el.innerHTML);
  userInfo.followNum = await page.$eval(
    selector.followNum,
    (el) => el.innerHTML
  );
  userInfo.fansNum = await page.$eval(selector.fansNum, (el) => el.innerHTML);
  try {
    await page.$(selector.tabCount);
    userInfo.tabCount = await page.$eval(
      selector.tabCount,
      (el) => el.innerHTML
    );
  } catch (error) {
    userInfo.tabCount = 0;
  }

  await delay(200);
  return userInfo;
}

function sleep(timeout) {
  return new Promise((res) => {
    setTimeout(() => {
      res(timeout);
    }, timeout);
  });
}

async function initPage(page) {
  // const browser = await puppeteer.connect({
  //   browserWSEndpoint: getWsUrl(),
  // });

  // const page = await browser.newPage();
  // await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });
  // return page;
}
module.exports = {
  strRemoveImg,
  getWsUrl,
  getInfo,
  sleep,
  initPage,
};
