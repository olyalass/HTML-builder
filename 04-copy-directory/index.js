const filesys = require("fs");
const path = require("path");
const source = path.join(__dirname, "./files");
const dest = path.join(__dirname, "./files-copy");

function copyDir(source, dest) {
  doesExist(dest, (err, exist) => {
    if (exist) {
      filesys.rm(
        dest,
        {
          recursive: true,
          force: true,
        },
        (err) => {
          if (err) {
            throw err;
          }
          copyDir(source, dest);
        }
      );
    } else {
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
  });
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

copyDir(source, dest);
