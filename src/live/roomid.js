const fs = require("fs");
const { shuffleArray } = require("../../utils");

const text = fs.readFileSync("./roomId.txt", { encoding: "utf-8" });

const roomIdData = text
  .replace(/(\r?\n)/g, ",")
  .split(",")
  .filter(Boolean)
  .map((live_id) => ({
    live_id,
  }));

function findDuplicateRoomIds(roomIdData) {
  let roomIds = {};
  let duplicates = [];

  roomIdData.forEach((item) => {
    const roomId = item.live_id;
    if (roomIds[roomId]) {
      if (roomIds[roomId] === 1) {
        duplicates.push(roomId);
      }
      roomIds[roomId]++;
    } else {
      roomIds[roomId] = 1;
    }
  });

  return duplicates;
}

console.log(
  "总数：",
  roomIdData.length,
  "重复的roomid：",
  findDuplicateRoomIds(roomIdData)
);

const createUrl = () =>
  roomIdData.map((item) => ({
    ...item,
    url: `https://live.douyin.com/${item.live_id}?enter_from_merge=web_chat&enter_method=live_share&room_id=7363320154869992231`,
    type: "live_room",
  }));

module.exports = {
  roomIdData: shuffleArray(createUrl()),
};
