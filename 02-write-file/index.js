const filesys = require("fs");
const { stdin, stdout } = process;
const newFile = filesys.createWriteStream("02-write-file/answers.txt");

stdout.write("Добро пожаловать!\n");
process.on("SIGINT", () => {
  process.exit();
});

stdin.on("data", (answer) => {
  if (answer.toString().trim() === "exit") {
    process.exit();
  }
  newFile.write(answer);
});

process.on("exit", (code) => {
  if (code === 0) {
    stdout.write("\nПока!");
  }
});
