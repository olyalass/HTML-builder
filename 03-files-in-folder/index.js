const filesys = require("fs");
const path = require("path");

const dir = path.join(__dirname, "./secret-folder");

filesys.readdir(dir, { withFileTypes: true }, (err, files) => {
  if (err) {
    console.error(`Error: ${err}`);
    return;
  }

  files
    .filter((e) => e.isFile())
    .forEach((e) => {
      const filePath = path.join(dir, e.name);
      filesys.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error: ${err}`);
          return;
        }

        const ext = path.extname(filePath);
        const size = stats.size;
        console.log(`${e.name} - ${ext} - ${size} bytes`);
      });
    });
});
