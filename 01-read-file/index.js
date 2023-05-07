const path = require("path");
const filesys = require("fs");
const { stdout } = process;

const dir = path.join(__dirname, "./text.txt");
const stream = new filesys.ReadStream(dir);
stream.on("readable", function () {
  const text = stream.read();
  if (text != null) {
    stdout.write(text);
  }
});
