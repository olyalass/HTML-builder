const filesys = require("fs");
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
  "{{footer}}": path.join(__dirname, "./components/footer.html"),
  "{{about}}": path.join(__dirname, "./components/about.html"),
};

function buildHtml() {
  if (doesExist(dist)) {
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

      insertFiles();

      copyDir(assets, newAssets);

      combineCss(styles, styleFile);
    });
  }
}

function insertFiles() {
  filesys.readFile(target, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    }

    let modifiedData = data;

    Object.keys(zones).forEach((zoneName) => {
      if (modifiedData.includes(zoneName)) {
        const zoneContents = filesys.readFileSync(zones[zoneName], "utf8");
        modifiedData = modifiedData.replace(zoneName, zoneContents);
      }
    });

    filesys.writeFile(newFile, modifiedData, "utf8", (err) => {
      if (err) {
        console.error(err);
      }
    });
  });
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

buildHtml();
