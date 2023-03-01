const execSync = require("child_process").execSync;
const path = require("path");

const themes = require("./themes");
const { getAllDir } = require("./FsTools");
const variables = require("./variables");
const config = require("../config");
const { logError } = require("./ErrorHandler");
const { GIT_BASE_BRANCH } = require("./variables");

exports.gitCloneRepos = async (repo, helpers = false) => {
  if (
    getAllDir(
      `./${helpers ? variables.HELPERS_REPO : variables.REPOS}`
    ).includes(repo)
  ) {
    await this.gitPull(
      repo,
      `./${helpers ? variables.HELPERS_REPO : variables.REPOS}`
    );
  } else {
    await this.gitClone(
      repo,
      `./${helpers ? variables.HELPERS_REPO : variables.REPOS}`
    );
  }
};

exports.gitClone = async (repoName, destination) => {
  try {
    console.log(themes.message(`>------>> [${repoName}] cloning.`));
    execSync(
      `git clone ${config.GIT_PROFILE}:${config.GIT_ORG}/${repoName}.git`,
      {
        cwd: path.join(__dirname, `/../${destination}`)
      }
    );
  } catch (error) {
    logError({ message: "git clone Error", error });
  }
};

exports.gitPull = async (repoName, destination, branch = GIT_BASE_BRANCH) => {
  try {
    console.log(themes.message(`>------>> [${repoName}] pulling.`));
    execSync(`git checkout ${branch}`, {
      cwd: `${destination}/${repoName}`
    });
    execSync(`git pull origin ${branch}`, {
      cwd: `${destination}/${repoName}`
    });
  } catch (error) {
    logError({ message: "git pull Error", error });
  }
};
