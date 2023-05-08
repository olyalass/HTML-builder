const filesys = require("fs");
const path = require("path");
const source = path.join(__dirname, "./files");
const dest = path.join(__dirname, "./files-copy");

function copyDir(source, dest) {
  if (doesExist(dest)) {
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
}

function doesExist(path) {
  try {
    const stats = filesys.statSync(path);
    return stats.isDirectory();
  } catch (err) {
    if (err.code === "ENOENT") {
      return false;
    } else {
      throw err;
    }
  }
}

copyDir(source, dest);
