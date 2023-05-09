const filesys = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const target = path.join(__dirname, "./template.html");
const newFile = path.join(__dirname, "./project-dist/index.html");
const dist = path.join(__dirname, "./project-dist");
const assets = path.join(__dirname, "./assets");
const newAssets = path.join(__dirname, "./project-dist/assets");
const styles = path.join(__dirname, "./styles");
const ext = ".css";
const styleFile = path.join(__dirname, "./project-dist/style.css");
const zones = {
  "{{header}}": path.join(__dirname, "./components/header.html"),
  "{{articles}}": path.join(__dirname, "./components/articles.html"),
  "{{about}}": path.join(__dirname, "./components/about.html"),
  "{{footer}}": path.join(__dirname, "./components/footer.html"),
};

function buildHtml() {
  doesExist(dist, (err, exist) => {
    if (exist) {
      filesys.rm(
        dist,
        {
          recursive: true,
          force: true,
        },
        (err) => {
          if (err) {
            throw err;
          }
          buildHtml();
        }
      );
    } else {
      filesys.mkdir(dist, { recursive: true }, (err) => {
        if (err) {
          throw err;
        }

        insertFiles()
          .then(() => {
            console.log("Files inserted successfully");
          })
          .catch((err) => {
            console.error(err);
          });

        copyDir(assets, newAssets);

        combineCss(styles, styleFile);
      });
    }
  });
}

async function insertFiles() {
  const targetFile = await fsPromises.readFile(target, "utf8");

  return Object.entries(zones)
    .reduce((acc, [zone, zoneFile]) => {
      if (targetFile.includes(zone)) {
        return acc.then(
          (data) =>
            new Promise((writeNewFile, reject) => {
              filesys.readFile(zoneFile, "utf-8", (error, zoneContents) => {
                if (error) {
                  console.error(`Error reading ${zone}: ${error.message}`);
                  reject(error);
                } else {
                  writeNewFile(data.replace(zone, zoneContents));
                }
              });
            })
        );
      }

      return acc;
    }, Promise.resolve(targetFile))
    .then(
      (data) =>
        new Promise((resolve, reject) => {
          filesys.writeFile(newFile, data, "utf8", (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        })
    );
}

function doesExist(path, callback) {
  filesys.stat(path, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        callback(false);
      } else {
        callback(err);
      }
    } else {
      callback(null, stats.isDirectory());
    }
  });
}

function copyDir(source, dest) {
  filesys.mkdir(dest, { recursive: true }, (err) => {
    if (err) {
      throw err;
    }

    filesys.readdir(source, { withFileTypes: true }, (err, files) => {
      if (err) {
        throw err;
      }

      files.forEach((e) => {
        const sourceFile = path.join(source, e.name);
        const destFile = path.join(dest, e.name);

        if (e.isDirectory()) {
          copyDir(sourceFile, destFile);
        } else {
          filesys.copyFile(sourceFile, destFile, (err) => {
            if (err) {
              throw err;
            }
          });
        }
      });
    });
  });
}

function combineCss(source, dest) {
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

buildHtml();
