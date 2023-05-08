const filesys = require("fs");
const path = require("path");
const source = path.join(__dirname, "./styles");
const ext = ".css";
const dest = path.join(__dirname, "./project-dist/bundle.css");

function combineCss() {
  const data = [];

  filesys.readdir(source, { withFileTypes: true }, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach((e) => {
      if (e.isFile() && path.extname(e.name) === ext) {
        const filePath = path.join(source, e.name);
        const styles = filesys.readFileSync(filePath, "utf8");
        data.push(styles);
      }
    });

    const combinedData = data.join("\n");
    filesys.writeFile(dest, combinedData, "utf8", (err) => {
      if (err) {
        throw err;
      }
    });
  });
}

combineCss();
