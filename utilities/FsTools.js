const fs = require("fs");
const fse = require("fs-extra");

const { logError } = require("./ErrorHandler");
const variables = require("./variables");

const config = require("../config");

exports.getAllDir = (source) => {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
};
exports.getAllFileInDir = (source) => {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((file) => !file.isDirectory())
    .map((file) => file.name);
};

exports.copyDirToDir = (source, destination) => {
  fse.copySync(source, destination);
};

exports.removeAuHelperFromPackageJson = (repo) => {
  try {
    let pkgJson = JSON.parse(
      fse.readFileSync(`./Repos/${repo}/src/package.json`)
    );
    delete pkgJson.dependencies["au-helpers"];
    fse.writeFileSync(
      `./Repos/${repo}/src/package.json`,
      JSON.stringify(pkgJson)
    );
  } catch (error) {
    logError(error);
  }
};

exports.addAuHelperFromPackageJson = (repo) => {
  try {
    let pkgJson = JSON.parse(
      fse.readFileSync(`./Repos/${repo}/src/package.json`)
    );
    pkgJson.dependencies = Object.assign(
      {
        [variables.HELPERS
          .NAME]: `git+ssh://git@github.com:${config.GIT_ORG}/${variables.HELPERS.NAME}.git`
      },
      pkgJson.dependencies
    );
    fse.writeFileSync(
      `./Repos/${repo}/src/package.json`,
      JSON.stringify(pkgJson, null, 2) + "\n"
    );
  } catch (error) {
    logError(error);
  }
};
