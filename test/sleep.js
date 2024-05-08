function sleep() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

async function run() {
  if (1) {
    console.log(1);
    await sleep();
  }
  console.log(2);
}
run();
