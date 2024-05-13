const fs = require("fs");
var log = require("single-line-log").stdout;
const path = require("path");
const { createPuppeteer, pclog, createCwdCacheFile } = require("utils");

const { initDb } = require("./db");
const db = initDb();

analysis();

function analysis() {
  const localData = db.get("all").value();

  const f = localData.filter((m) => m.status === "已关注");

  console.log(f.length, "个不互关");
  db.set("notFollowList", f).write();
}
