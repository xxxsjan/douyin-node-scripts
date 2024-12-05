const fs = require("fs");
const path = require("path");
const shuffle = require("lodash/shuffle");

const getTodoUrls = () => {
  const httpLogFile = path.resolve(__dirname, "assets/229_Headers.txt");

  const res = fs.readFileSync(httpLogFile, { encoding: "utf-8" });

  const users = res.match(
    /(?<=GET )https:\/\/www.douyin\.com\/user\/.+(?= HTTP)/g
  );
  const rooms = res.match(/(?<=GET )https:\/\/live\.douyin\.com\/.+(?= HTTP)/g);

  // rooms.push(
  //   "https://live.douyin.com/760731992058?enter_from_merge=web_chat&enter_method=live_share&room_id=7365189585246227235"
  // );

  // 仒零
  rooms.unshift(
    "https://www.douyin.com/user/MS4wLjABAAAAtDeRPK8XCaegfkt6WlDTMaZ-LlEuy0woranHM-jmBjM"
  );
  console.log("users: ", users.length);
  console.log("rooms: ", rooms.length);
  const reg = /live\.douyin\.com/;

  const todoList = [...users, ...rooms].map((url) => {
    return {
      url: new URL(url).origin + new URL(url).pathname,
      type: reg.test(url) ? "live_url" : "home_page",
      live_id: reg.test(url) ? new URL(url).pathname.replace("/", "") : "",
    };
  });

  return shuffle(todoList);
};

module.exports = {
  getTodoUrls,
};
