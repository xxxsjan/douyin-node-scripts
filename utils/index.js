const { delay } = require("bluebird");
const fs = require("fs");
const path = require("path");
const prompts = require("prompts");
const pc = require("picocolors");

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
async function getWsUrl() {
  let cacheData, defaultWs;

  const cachePath = path.resolve(__dirname, "../cache.json");

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

function createRootDir(dirs) {
  dirs.map((dir) => {
    const dirPath = path.resolve(__dirname, `../${dir}`);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  });
}

// 判断文件夹是否存在
function createDir(folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.log(`${folderPath} 不存在，将创建文件夹`);
    try {
      // 创建文件夹
      fs.mkdirSync(folderPath, { recursive: true });
      console.log("文件夹创建成功");
    } catch (err) {
      console.error("创建文件夹失败:", err);
    }
  } else {
    console.log(`${folderPath} 存在`);
  }
}

function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function shuffleArray(array) {
  const newArray = array.slice(); // 创建原数组的副本

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

module.exports = {
  strRemoveImg,
  getWsUrl,
  getInfo,
  sleep,
  createRootDir,
  createDir,
  randomNum,
  shuffleArray,
};
