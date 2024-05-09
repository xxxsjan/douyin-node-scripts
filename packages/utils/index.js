function shuffleArray(array) {
  const newArray = array.slice(); // 创建原数组的副本

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
}

module.exports = {
  shuffleArray,
};
