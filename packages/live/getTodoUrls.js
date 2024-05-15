const fs = require("fs");
const path = require("path");
const shuffle = require("lodash/shuffle");

const getTodoUrls = () => {
  const httpLogFile = path.resolve(__dirname, "assets/229_Headers.txt");
  console.log("httpLogFile: ", httpLogFile);
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

  const todoList = [...users, ...rooms].map((url) => {
    const isLiveURL = /live\.douyin\.com/.test(url);
    return {
      url,
      type: isLiveURL ? "live_url" : "home_page",
      live_id: isLiveURL ? new URL(url).pathname.replace("/", "") : "",
    };
  });

  return shuffle(todoList);
};

module.exports = {
  getTodoUrls,
};
