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

    const cssFiles = files.filter(
      (e) => e.isFile() && path.extname(e.name) === ext
    );
    let pending = cssFiles.length;

    cssFiles.forEach((e) => {
      const filePath = path.join(source, e.name);

      filesys.readFile(filePath, "utf8", (err, styles) => {
        if (err) {
          throw err;
        }

        data.push(styles);
        pending--;

        if (pending === 0) {
          const combinedData = data.join("\n");

          filesys.writeFile(dest, combinedData, "utf8", (err) => {
            if (err) {
              throw err;
            }
          });
        }
      });
    });
  });
}

combineCss();
