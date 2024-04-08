const puppeteer = require("puppeteer");
const { delay } = require("bluebird");
const ms = require("ms");

const fs = require("fs");
var log = require("single-line-log").stdout;
const path = require("path");

const { getWsUrl } = require("../../utils");

(async () => {
  await run();
})();
async function run() {
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: getWsUrl(),
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 600, deviceScaleFactor: 1 });

    await page.goto("https://www.douyin.com/user/self");
    const fansDom = await page.waitForSelector(".WetwxGAE.GQQEtJnJ");

    const followCountDom = ".sCnO6dhe";
    const followCount = await page.$eval(followCountDom, (el) => el.innerHTML);

    const maxNum = Number(followCount);

    fansDom.click();
    //  列表容器
    const wrapperElSelector = '.eq0kzn5a[data-e2e="user-fans-container"]';
    await page.waitForSelector(wrapperElSelector);

    let data = {};
    let isFoot = false;
    while (!isFoot) {
      const _data = await page.evaluate(
        ({ maxNum, selector }) => {
          const w = document.querySelector(selector.scrollWrapper);

          const { scrollTop, scrollHeight, clientHeight } = w;
          const elements = document.querySelectorAll(selector.scrollItem);
          const renderNum = elements.length;

          console.log("当前渲染个数：", renderNum);

          let top = w.scrollHeight - w.clientHeight + 10;

          const result = {
            scrollTop,
            scrollHeight,
            clientHeight,
            renderNum,
          };

          if (renderNum >= maxNum) {
            const curData = [];
            elements.forEach((element) => {
              const nickname =
                element.querySelector(".j5WZzJdp > span").textContent;
              const status = element.querySelector(
                ".DrgO6Dle .mqZgWvzs"
              ).textContent;
              const link = element.querySelector(".iAqs9BfT .hY8lWHgA").href;
              curData.push({
                nickname, // 昵称
                status, // 关注状态
                link,
              });
            });
            return { ...result, isFoot: true, curData };
          }
          w.scrollTo(0, top);
          return { ...result, isFoot: false };
        },
        {
          // maxNum: 123,
          maxNum, // 最大显示个数，参考关注数
          selector: {
            scrollWrapper: wrapperElSelector, // 容器class
            scrollItem: ".QxZvDLx8", // 子项class
          },
        }
      );

      await delay(ms("1s"));
      if (_data.isFoot) {
        isFoot = true;
        data = _data;
      }
      console.log("🚀  :", _data.renderNum, followCount, maxNum);
    }

    data.curData && saveArray(data.curData);
    return;
    // await browser.close();
    // process.exit();
  } catch (error) {
    log("error: ", error);
  }
}
function saveArray(data) {
  const jsonData = JSON.stringify(data);
  const folderPath = path.resolve(__dirname, "cache");
  const filePath = path.join(folderPath, "all.json");
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  fs.writeFile(filePath, jsonData, (err) => {
    if (err) {
      log("Error writing JSON file:", err);
    } else {
      log("JSON file saved successfully!" + filePath);
    }
  });
}
