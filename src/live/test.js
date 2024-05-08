const pc = require("picocolors");
const { delay } = require("bluebird");
const ms = require("ms");

const { createPuppeteer } = require("../../utils/createPuppeteer");

run();

async function run() {
  try {
    const { page } = await createPuppeteer();

    // process.exit();
  } catch (error) {
    console.log("live error", pc.bgRed(error));
  }
}
