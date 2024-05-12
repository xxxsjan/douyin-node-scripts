const fs = require("fs");
var log = require("single-line-log").stdout;
const path = require("path");

analysis();

function analysis() {
  const folderPath = path.resolve(__dirname, "cache");
  const filePath = path.join(folderPath, "all.json");
  // 判断文件是否存在
  if (!fs.existsSync(filePath)) {
    console.log("文件不存在");
    return;
  }
  const localData = require(filePath);

  const f = localData.filter((m) => m.status === "已关注");

  console.log(f.length, "个不互关");

  fs.writeFile(
    path.join(folderPath, "unfollow-result.json"),
    JSON.stringify(f),
    (err) => {
      if (err) {
        log("Error writing JSON file:", err);
      } else {
        log("保存位置：", path.join(folderPath, "unfollow-result.json"));
      }
    }
  );
}