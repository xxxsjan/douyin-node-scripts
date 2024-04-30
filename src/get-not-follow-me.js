// const puppeteer = require("puppeteer-core");
const puppeteer = require("puppeteer");

const ms = require("ms");
const { delay } = require("bluebird");
const fs = require("fs");
var log = require("single-line-log").stdout;
const path = require("path");

const { selector } = require("../config");
const { getWsUrl, getInfo, strRemoveImg, sleep } = require("../utils");
const { createPuppeteer } = require("../utils/createPuppeteer");
const outputPath = path.resolve(__dirname, "../data/not-follow-me.json");

(async () => {
  if (!fs.existsSync(path.resolve(__dirname, "../data/follow-list.json"))) {
    return;
  }
  const { browser, page } = await createPuppeteer();
  const allFollowList = require("../data/follow-list.json");

  const eachFollow = allFollowList.all.filter(
    (item) => item.status === "相互关注"
  );
  const onlyMeFollow = allFollowList.all.filter(
    (item) => item.status === "已关注"
  );

  console.log("相互关注", eachFollow.length);
  console.log("未相互关注", onlyMeFollow.length);
  // 最新缓存文件
  const cachePath = getLastCacheFile();
  console.log("cachePath: ", cachePath);

  let cacheData = cachePath ? require(cachePath).data : [];

  // 格式化
  cacheData.forEach((item) => {
    item.nickName = item.nickName || item.name;
    item.name && delete item.name;
  });

  // 移除以前关注 现在不关注的
  const allName = allFollowList.all.map((it) => it.name);
  const preNum = cacheData.length;

  cacheData = cacheData.filter((item) => allName.includes(item.nickName));

  const curNum = cacheData.length;

  console.log("移除关注：", preNum - curNum);

  let notFollowList = cacheData.length > 0 ? [...cacheData] : [];

  console.log("notFollowList: ", notFollowList.length);

  const newFollowList = [];
  try {
    console.log("新增关注：", "作品：", "当前", "总共");
    for (let i = 0; i < onlyMeFollow.length; i++) {
      const it = onlyMeFollow[i];

      // 缓存里有 使用
      if (cacheData.find((f) => f.nickName === (it.nickName || it.name))) {
        // console.log('缓存里有');
        continue;
      }
      // 缓存
      if (i !== 0 && i % 10 === 0) {
        fs.writeFileSync(
          path.resolve(__dirname, `../cache/not-follow-me-${i}.json`),
          JSON.stringify({ data: notFollowList })
        );
        // console.log(`临时缓存------------../cache/not-follow-me-${i}.json`);
      }
      await sleep(2000);
      const userInfo = await getInfo(page, it.home);

      const res = {
        ...it,
        ...userInfo,
      };
      log(strRemoveImg(res.name), res.tabCount, i, "/", onlyMeFollow.length);
      newFollowList.push(res);
      notFollowList.push(res);
      //
      await page.waitForSelector(selector.userInfoWrapper);
    }
  } catch (error) {
    console.log("error: ", error);
  } finally {
    console.log("新增关注：", newFollowList.length);
  }

  // console.log('notFollowList: ', notFollowList);
  fs.writeFileSync(outputPath, JSON.stringify({ data: notFollowList }));
  // 更新缓存
  fs.writeFileSync(
    path.resolve(
      __dirname,
      `../cache/not-follow-me-${notFollowList.length}.json`
    ),
    JSON.stringify({ data: notFollowList })
  );
  // 删除多余缓存
  getLastCacheFile(`../cache/not-follow-me-${notFollowList.length}.json`);
  console.log("已保存 ", outputPath);
  // await browser.close();
  process.exit();
})();

function getLastCacheFile(superPath) {
  let files = fs.readdirSync(path.resolve(__dirname, "../cache"));
  let lastNum;
  if (!superPath) {
    lastNum = files.reduce((pre, cur) => {
      const flag = /not-follow-me-([0-9]+).json/g.test(cur);
      if (flag) {
        const numStr = cur.replace(
          /not-follow-me-([0-9]+).json/g,
          function (...args) {
            return args[1];
          }
        );
        return Math.max(numStr, pre);
      } else {
        return pre;
      }
    }, 0);
    if (lastNum) {
      files.map((file) => {
        const fileP = path.resolve(__dirname, `../cache/${file}`);
        if (file !== `not-follow-me-${lastNum}.json`) {
          fs.unlinkSync(fileP);
          console.log("delete", fileP);
        }
      });
    }
  } else {
    files.map((file) => {
      const fileP = path.resolve(__dirname, `../cache/${file}`);
      if (fileP !== superPath) {
        fs.unlinkSync(fileP);
        console.log("delete", fileP);
      }
    });
    return superPath;
  }
  return lastNum ? `../cache/not-follow-me-${lastNum}.json` : null;
}
