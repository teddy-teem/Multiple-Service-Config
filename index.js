const fs = require("fs");
const execSync = require("child_process").execSync;
// const prompt = require("prompt-sync")();

let { RepoList, Helpers } = require("./repos.json");
const { gitCloneRepos } = require("./utilities/GitTools");
const { configEnv } = require("./utilities/EnvTools");
const { npmInstall } = require("./utilities/NpmTools");
const variables = require("./utilities/variables");
const { logError } = require("./utilities/ErrorHandler");
const themes = require("./utilities/themes");
const { getAllDir } = require("./utilities/FsTools");

const arg = process.argv;

if (!fs.existsSync(`./${variables.REPOS}`)) {
  fs.mkdirSync(`${variables.REPOS}`);
}
if (!fs.existsSync(`./${variables.HELPERS_REPO}`)) {
  fs.mkdirSync(`${variables.HELPERS_REPO}`);
}
if (!fs.existsSync(`./${variables.MOCK_DATA}`)) {
  fs.mkdirSync(`${variables.MOCK_DATA}`);
}
if (arg[2] && arg[2].toLowerCase() === "update") {
  RepoList = getAllDir(`./${variables.REPOS}`);
}

(async () => {
  console.log(
    themes.startHeader(`---------------Setting up Helpers---------------`)
  );
  for (let helper of Helpers) {
    try {
      await gitCloneRepos(helper, true);
      console.log(themes.success(`>------>> [${helper}] cloned/pulled.`));
      console.log(themes.message(`>------>> [${helper}] npm i started.`));
      execSync(`npm install`, { cwd: `./${variables.HELPERS_REPO}/${helper}` });
      console.log(themes.success(`>------>> [${helper}] npm i done.`));
      console.log(
        themes.finishSingle(
          `----------------------[${helper} done]-------------------\n`
        )
      );
    } catch (error) {
      logError({ message: "Don't know why", error });
    }
  }
  for (let repo of RepoList) {
    try {
      console.log(
        themes.startSubHeader(`---------------[${repo} started]---------------`)
      );
      await gitCloneRepos(repo);
      console.log(themes.success(`>------>> [${repo}] cloned/pulled.`));
      await configEnv(repo);
      console.log(themes.success(`>------>> [${repo}] env configured.`));
      await npmInstall(repo);
      console.log(themes.success(`>------>> [${repo}] 'npm i' done.`));
      console.log(
        themes.finishSingle(
          `----------------------[${repo} done]-------------------\n`
        )
      );
    } catch (error) {
      logError({ message: "Don't know why", error });
    }
  }
})();
