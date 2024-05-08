const pc = require("picocolors");

const prompts = require("prompts");

(async function () {
  const response = await prompts({
    type: "text",
    name: "ws",
    message: "ws地址",
    initial: "defaultWs",
  });
  console.log(pc.green(response));
})();
