const pc = require("picocolors");

const fs = require("fs");
const path = require("path");

const prompts = require("prompts");

(async function () {
  const response = await prompts({
    type: "text",
    name: "name",
    message: "文件名",
    initial: "test.txt",
  });
  console.log(pc.green(response));
  console.log(response);

  fs.writeFileSync(hadViewPath, "test text");
})();
