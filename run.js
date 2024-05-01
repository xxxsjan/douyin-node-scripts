const { exec, execFileSync, execFile, spawn } = require("child_process");
const shell = require("shelljs");

console.log(process.argv);

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
