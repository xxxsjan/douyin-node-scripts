const { createPuppeteer } = require("utils");
const { delay } = require("bluebird");
const ms = require("ms");

(async function () {
  const { page } = await createPuppeteer();

  await page.goto(
    "https://www.douyin.com/user/MS4wLjABAAAA4dV1PzWuQ45gHOU_F1LtcLbYh57C-mISdsP0BVyT0Ag"
  );
})();
