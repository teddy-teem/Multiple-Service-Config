const execSync = require("child_process").execSync;

const themes = require("./themes");

const {
  getAllDir,
  getAllFileInDir,
  copyDirToDir,
  removeAuHelperFromPackageJson,
  addAuHelperFromPackageJson
} = require("./FsTools");
const { logError } = require("./ErrorHandler");
const variables = require("./variables");

exports.npmInstall = async (repo) => {
  try {
    if (
      !repo.includes(variables.REPO_TYPE.SERVICE) &&
      !repo.includes(variables.REPO_TYPE.ADAPTER) &&
      !repo.includes(variables.REPO_TYPE.WORKER)
    ) {
      throw Object.assign(new Error(), {
        message: `${repo} isn't included in ${Object.keys(variables.REPO_TYPE)}`
      });
    }
    const allResourcesDir = getAllDir(`./Repos/${repo}`);
    if (!allResourcesDir.includes(variables.SRC_DIR_NAME)) {
      throw Object.assign(new Error(), {
        message: `${repo} doesn't have ${variables.SRC_DIR_NAME} dir`
      });
    }
    const allResources = getAllFileInDir(`./Repos/${repo}/src`);
    if (!allResources.includes("package.json")) {
      throw Object.assign(new Error(), {
        message: `${repo} doesn't have 'package.json' dir`
      });
    }
    removeAuHelperFromPackageJson(repo);
    console.log(themes.message(`>------>> [${repo}] 'npm i' started `));
    execSync(`npm install`, {
      cwd: `./Repos/${repo}/src`
    });
    addAuHelperFromPackageJson(repo);
    copyDirToDir(`./HELPERS`, `./Repos/${repo}/src/node_modules`);
  } catch (error) {
    logError(error);
  }
};
