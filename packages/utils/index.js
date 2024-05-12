const pc = require("picocolors");

function shuffleArray(array) {
  const newArray = array.slice(); // 创建原数组的副本

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}
const log = new Proxy(pc, {
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
  shuffleArray,
  log,
};
