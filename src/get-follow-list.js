const puppeteer = require("puppeteer");
const ms = require("ms");
const { delay } = require("bluebird");
const fs = require("fs");
const path = require("path");
var log = require("single-line-log").stdout;

const { selector, homeUrl } = require("../config");
const { getWsUrl, getInfo, strRemoveImg, initPage } = require("../utils");

const outputPath = path.resolve(__dirname, "../data/follow-list.json");

async function main() {
  const browser = await puppeteer.connect({
    browserWSEndpoint: getWsUrl(),
  }); // 使用debug浏览器
  // const browser = await puppeteer.launch({ headless: false});// 打开浏览器
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });

  const userInfo = await getInfo(page, homeUrl);
  console.log("userInfo: ", JSON.stringify(userInfo));

  async function getFollow() {
    const originData = require("../data/follow-list.json") || {};
    console.log("上次关注的数据", originData.all.length, "条");

    const followBtn = await page.waitForSelector(selector.followNum);
    followBtn.click();

    await page.waitForSelector(selector.scrollWrapper);
    // 滚动获取全部数据
    const data = await getAllList(page, userInfo.followNum);
    console.log("现在关注的数据", data);

    // 遍历获取数据
    const list = await page.evaluate((selector) => {
      const arr = Array.from(
        document.querySelectorAll(selector.scrollItem)
      ).map((el) => {
        const selector = {
          // 头像  .vcEWxPjN .BszJJe7i a
          home: ".vcEWxPjN .dxFWVDGf a",
          // 昵称 .yv6aJQcW .Nu66P_ba span span span span
          name: ".TXnCOMLE .Nu66P_ba >span> span > span> span",
          // 签名 .o02BfgJo .Nu66P_ba span span span span
          sign: ".o02BfgJo .Nu66P_ba >span> span> span> span",
          // 是否互关 .jVOvKF5C.GNgMFcUD .cNFB52sk
          status: ".jVOvKF5C.GNgMFcUD .cNFB52sk",
        };
        const home = el.querySelector(selector.home).href;
        const name = el.querySelector(selector.name).innerHTML;
        const sign = el.querySelector(selector.sign)
          ? el.querySelector(selector.sign).innerHTML
          : "";
        const status = el.querySelector(selector.status).innerHTML;
        return { home, name, status, sign };
      });
      return arr;
    }, selector);
    const single = list.filter((it) => it.status === "已关注");
    const mutual = list.filter((it) => it.status === "相互关注");
    console.log("相互关注", mutual.length);
    console.log("未相互关注", single.length);
    console.log("关注", list.length);
    console.log("开始保存数据...");
    // 保存数据
    fs.writeFileSync(outputPath, JSON.stringify({ all: list }));

    console.log("已保存", outputPath, "本次更新数据", list.length, "条");
  }

  async function getFans() {
    const fansBtn = await page.waitForSelector("div[data-e2e=user-info-fans]");
    fansBtn.click();
    await page.waitForSelector(".Pxf0E4cv");
    // 滚动获取全部数据
    const data = await getAllList(page, userInfo.followNum);
    console.log("data", data);

    const list = await page.evaluate(() => {
      const arr = Array.from(document.querySelectorAll(".vcEWxPjN")).map(
        (el) => {
          // 主页  .vcEWxPjN .BszJJe7i a
          // 昵称 .yv6aJQcW .Nu66P_ba span span span span
          // 是否互关 .jVOvKF5C.GNgMFcUD .cNFB52sk
          const home = el.querySelector(".vcEWxPjN .dxFWVDGf a").href;
          const name = el.querySelector(
            ".TXnCOMLE .Nu66P_ba >span> span > span> span"
          ).innerHTML;
          console.log("name: ", name);
          const sign = el.querySelector(
            ".o02BfgJo .Nu66P_ba >span> span> span> span"
          )
            ? el.querySelector(".o02BfgJo .Nu66P_ba >span> span> span> span")
                .innerHTML
            : "";
          const status = el.querySelector(".jVOvKF5C .cNFB52sk").innerHTML;
          return { home, name, status, sign };
        }
      );
      return arr;
    });
    const mutual = list.filter((it) => it.status === "相互关注");
    const notFollow = list.filter((it) => it.status === "回关");
    console.log("相互关注", mutual.length);
    console.log("未回关", notFollow.length);
    fs.writeFileSync(
      "./data/fans-list.json",
      JSON.stringify({ all: list, notFollow, mutual })
    );
  }

  async function cancelFollow() {
    const followBtn = await page.waitForSelector(
      "div[data-e2e=user-info-follow]"
    );
    followBtn.click();

    await page.waitForSelector(".Pxf0E4cv");

    const lessThanTen = require("../data/not-follow-me.json")
      .data.filter((f) => f.fansNum.indexOf("w") === -1)
      .filter((f) => Number(f.fansNum) > 5000)
      .map((it) => {
        return it.nickName;
      });

    // 滚动获取全部数据
    const data = await getAllList(page, 1300);
    console.log("data", data);

    const list = await page.evaluate(async (lessThanTen) => {
      function sleep(time) {
        return new Promise((res) => {
          setTimeout(() => {
            res();
          }, time);
        });
      }
      const arr = Array.from(document.querySelectorAll(".vcEWxPjN"));
      const res = [];
      for (let i = 0; i < arr.length; i++) {
        const el = arr[i];
        const name = el.querySelector(
          ".TXnCOMLE .Nu66P_ba >span> span > span> span"
        ).innerHTML;
        const status = el.querySelector(
          ".jVOvKF5C.GNgMFcUD .cNFB52sk"
        ).innerHTML;
        if (status === "已关注" && lessThanTen.includes(name)) {
          const btn = el.querySelector(".jVOvKF5C.GNgMFcUD .cNFB52sk");
          console.log(btn);
          if (btn) {
            console.log(lessThanTen.includes(name), name);
            await sleep(555);
            btn.click();
            res.push(name);
          }
        }
      }
      return res;
    }, lessThanTen);
    console.log("取关了:", list);
  }

  async function getUserInfo() {
    const followBtn = await page.waitForSelector(
      "div[data-e2e=user-info-follow]"
    );
    followBtn.click();
    await page.waitForSelector(".Pxf0E4cv");
    // 滚动获取全部数据
    const data = await getAllList(page, 20);
    console.log("data", data);

    const urls = await page.evaluate(() => {
      const arr = Array.from(document.querySelectorAll(".vcEWxPjN"));
      const selector = {
        head: ".vcEWxPjN .BszJJe7i a", // 头像
        nickName: ".yv6aJQcW .Nu66P_ba span span span span", // 昵称
        sign: ".o02BfgJo .Nu66P_ba span span span span", // 签名
        status: ".jVOvKF5C.GNgMFcUD .cNFB52sk", // 是否关注状态
        home: ".vcEWxPjN .dxFWVDGf a", // href  主页地址
      };
      const res = arr.map((el) => el.querySelector(selector.home).href);
      return res;
    });
    console.log(urls.length);
    const newPage = await browser.newPage();
    await newPage.setViewport({
      width: 1200,
      height: 600,
      deviceScaleFactor: 1,
    });

    const userList = [];

    for (let i = 0; i < urls.length; j = i++) {
      userList.push(await getInfo(newPage, urls[i]));
    }
    console.log(userList);

    // await newPage.close();
  }
  await getFollow();

  // await browser.close();
  process.exit();
}
async function getAllList(page, showNum = 100) {
  let data = {};
  let isFoot = false;
  while (!isFoot) {
    const _data = await page.evaluate(
      ({ showNum, selector }) => {
        const w = document.querySelector(selector.scrollWrapper);
        const { scrollTop, scrollHeight, clientHeight } = w;
        const renderNum = document.querySelectorAll(selector.scrollItem).length;
        console.log("当前渲染个数：", renderNum, showNum);
        let top = w.scrollHeight - w.clientHeight + 10;

        const result = {
          scrollTop,
          scrollHeight,
          clientHeight,
          renderNum,
        };
        if (renderNum >= showNum) {
          return {
            ...result,
            isFoot: true,
          };
        }
        w.scrollTo(0, top);
        return {
          ...result,
          isFoot: false,
        };
      },
      { showNum, selector }
    );
    log("获取关注列表进度：", _data.renderNum, "/", showNum, _data.isFoot);

    await delay(ms("1s"));
    if (_data.isFoot) {
      isFoot = true;
      data = _data;
    }
  }
  return Promise.resolve(data);
}
main();
