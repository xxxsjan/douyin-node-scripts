const fs = require("fs");
const chalk = require("chalk");

const { strRemoveImg } = require("../utils");
const { resolve } = require("path");
const notF = require("../data/not-follow-me.json");
const { delay } = require("bluebird");
const allFollow = require("../data/follow-list.json").all;
var dayjs = require("dayjs");
console.log(["用户名", "粉丝数", "关注", "签名"]);
resultFn();

async function walk() {
  let res = [];
  for (let i = 0; i < notF.data.length; i++) {
    const item = notF.data[i];

    if (item.fansNum.indexOf("w") > 0 || item.fansNum.indexOf("万")) {
      // console.log([...setLog(item), '大博主']);
      continue;
    }
    if (Number(item.fansNum) > 8888) {
      // console.log([...setLog(item), '小博士']);
      continue;
    }
    if (item.sign.indexOf("主播") > 0) {
      // console.log([...setLog(item), '主播']);
      continue;
    }
    if (
      Number(item.followNum) < 10 ||
      Number(item.followNum) < Number(item.fansNum) * 0.6
    ) {
      res.push(item);
      console.log(chalk.red(JSON.stringify(setLog(item))));
    } else {
      console.log(setLog(item));
    }
  }
  return res;
}

async function resultFn() {
  if (
    !fs.existsSync(resolve(__dirname, "../data/follow-list.json")) ||
    !fs.existsSync(resolve(__dirname, "../data/not-follow-me.json"))
  ) {
    return;
  }
  const logPath = resolve(__dirname, "../data/analysis-log.json");
  let logData = [];
  if (fs.existsSync(logPath)) {
    logData = require(resolve(__dirname, "../data/analysis-log.json"));
  }
  const res = await walk();
  const time = new Date().toLocaleString();

  console.log(
    chalk.blueBright(
      time,
      "↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓查询结果↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓"
    )
  );
  const data = res.map((item) => {
    console.log(chalk.red(JSON.stringify(setLog(item))));
    return setLog(item);
  });

  if (data.length > 0) {
    console.log("上次数据：", logData.length);
    logData = logData.filter((item) => {
      const now = new Date(time);
      const old = new Date(item[0]);
      return (
        dayjs(now).diff(old, "hour") > 8 || dayjs(now).diff(old, "day") > 0
      );
    });
    logData.push([time, data]);
    fs.writeFileSync(logPath, JSON.stringify(logData));
    console.log("保存成功", time);
  }
  const newData = require(resolve(__dirname, "../data/analysis-log.json"));
  analysisArr(newData);
}
function setLog(item) {
  return [
    strRemoveImg(item.nickName),
    item.fansNum,
    item.followNum,
    strRemoveImg(item.sign),
  ];
}

function analysisArr(arr) {
  const nickNameList = allFollow.map((it) => it.name);
  const blackList = [];
  if (arr.length <= 1) {
    return arr;
  }
  let map = new Map();
  for (let item of arr) {
    const date = item[0];
    const data = item[1];
    data.map((it) => {
      const nickName = it[0];
      if (nickNameList.includes(nickName)) {
        const getD = map.get(nickName);
        if (getD) {
          const followNum = getD[2];
          const newFollowNum = it[2];
          map.set(nickName, [...getD, [date, it[2]]]);
        } else {
          map.set(nickName, [[date, it[2]]]);
        }
      } else {
        console.log("不再关注", nickName);
      }
    });
  }
  [...map.entries()].map((it) => {
    blackList.push(it[0]);
  });
  let errorData = [];
  blackList.map((item) => {
    if (allFollow.find((f) => f.name === item).status === "相互关注") {
      errorData.push(item);
    } else {
      console.log("💀", item);
    }
  });
  console.log("出错数据", errorData);
  process.exit();
}
