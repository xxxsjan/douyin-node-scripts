const path = require("path");
const fs = require("fs");
const pc = require("picocolors");
const { createPuppeteer } = require("./createPuppeteer");

function createCwdCacheFile(filename) {
  const dirPath = path.resolve(process.cwd(), "./cache");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.resolve(dirPath, filename);

  return filePath;
}
const pclog = new Proxy(pc, {
  get(target, property, receiver) {
    if (typeof target[property] === "function") {
      return function (...args) {
        return console.log(Reflect.apply(target[property], this, args));
      };
    }
    return target[property];
  },
});
module.exports = {
  pclog,
  createPuppeteer,
  createCwdCacheFile,
};
