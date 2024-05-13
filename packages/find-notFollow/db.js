const { createPuppeteer, pclog, createCwdCacheFile } = require("utils");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

function initDb() {
  const dbPath = createCwdCacheFile(`notFollow.json`);

  const adapter = new FileSync(dbPath);
  const db = low(adapter);

  db.defaults({ all: [], notFollowList: [] }).write();

  pclog.green("db 初始化完成");
  return db;
}

module.exports = {
  initDb,
};
