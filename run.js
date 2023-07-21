const { exec, execFileSync, execFile, spawn } = require("child_process");
const { futimesSync } = require("fs");
const shell = require("shelljs");

// 解析命令的库
// const program = require('commander');
// program.option('-p,--port [type] ', 'Add port ').parse(process.argv);
// if (program.port) port = program.port;
// console.log('imovie start on port ' + port);

// 不使用库，简单解析
// process.argv 第一个是node执行器的路径，第二个是当前执行js的文件路径，第三个起才是option

switch (process.argv[2]) {
  case "1":
    getFollowList();
    break;
  case "2":
    getNot();
    break;
  case "3":
    analysisData();
    break;
  default:
    console.log(
      "传参不对 \n",
      "node ./run.js 1 -----get follow list\n",
      "node ./run.js 2 -----get note follow me \n",
      "node ./run.js 3 -----analysis data \n"
    );
    break;
}

function getFollowList() {
  handleShell("node ./src/get-follow-list.js");
}
function getNot() {
  handleShell("node ./src/get-not-follow-me.js");
}
function analysisData() {
  handleShell("node ./src/analysis-follow.js");
}

function handleShell(command) {
  shell.exec(command, function (code, stdout, stderr) {
    console.log("Exit code:", code);
    console.log("Program output:", stdout);
    console.log("Program stderr:", stderr);
    if (code === 0) {
      console.log("code: ", code);
    }
  });
}
