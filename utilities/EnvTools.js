const dotenv = require("dotenv");
const fs = require("fs");
const os = require("os");

const themes = require("./themes");
const { getAllDir, getAllFileInDir } = require("./FsTools");
const { getPort, findPort } = require("./PortHelper");
const variables = require("./variables");
const { logError } = require("./ErrorHandler");

const config = require("../config");

exports.configEnv = async (repo) => {
  try {
    if (
      !repo.includes(variables.REPO_TYPE.SERVICE) &&
      !repo.includes(variables.REPO_TYPE.WORKER) &&
      !repo.includes(variables.REPO_TYPE.ADAPTER)
    ) {
      throw Object.assign(new Error(), {
        message: `${repo} isn't included in ${Object.keys(variables.REPO_TYPE)}`
      });
    }
    const allResourcesDir = getAllDir(`./${variables.REPOS}/${repo}`);
    if (!allResourcesDir.includes(variables.SRC_DIR_NAME)) {
      throw Object.assign(new Error(), {
        message: `src dir not found in ${repo} `
      });
    }

    const allResources = getAllFileInDir(
      `./${variables.REPOS}/${repo}/${variables.SRC_DIR_NAME}`
    );
    if (!allResources.includes(variables.ENV_FILE_DEV)) {
      throw Object.assign(new Error(), {
        message: `${variables.ENV_FILE_DEV} file not found in ${repo} `
      });
    }

    const envFileData = fs.readFileSync(
      `./${variables.REPOS}/${repo}/${variables.SRC_DIR_NAME}/${variables.ENV_FILE_DEV}`
    );
    fs.writeFileSync(
      `./${variables.REPOS}/${repo}/${variables.SRC_DIR_NAME}/${variables.ENV_FILE_LOCAL}`,
      envFileData
    );

    if (
      repo.includes(variables.REPO_TYPE.SERVICE) ||
      repo.includes(variables.REPO_TYPE.WORKER)
    ) {
      fs.appendFileSync(
        `./${variables.REPOS}/${repo}/${variables.SRC_DIR_NAME}/${variables.ENV_FILE_LOCAL}`,
        `\n\n#Local AWS Config`
      );
    }
    const portNumber = getPort(repo);
    this.updateEnv(
      `./${variables.REPOS}/${repo}/${variables.SRC_DIR_NAME}`,
      portNumber,
      repo
    );
    this.updateSQS(
      `./${variables.REPOS}/${repo}/${variables.SRC_DIR_NAME}`,
      repo
    );

    this.updateSpecialChanges(
      `./${variables.REPOS}/${repo}/${variables.SRC_DIR_NAME}`,
      repo
    );
  } catch (error) {
    logError(error);
  }
};

exports.updateEnv = (source, portNumber, repoName) => {
  const envData = fs.readFileSync(`${source}/.env`);
  const bufferData = Buffer.from(envData);
  const currentConfig = dotenv.parse(bufferData);
  const envUpdate = {
    ...currentConfig,
    APP_PORT: portNumber,
    ...((repoName.includes(variables.REPO_TYPE.SERVICE) ||
      repoName.includes(variables.REPO_TYPE.WORKER)) && {
      DYNAMO_ENDPOINT: config.LOCAL_AWS.DDB_ENDPOINT,
      AWS_ACCESS_KEY_ID: config.LOCAL_AWS.ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: config.LOCAL_AWS.ACCESS_KEY,
      AWS_REGION: config.LOCAL_AWS.REGION,
      SQS_ENDPOINT: `http://localhost:4566/000000000000/${currentConfig.SERVICE_NAME}-worker-sqs.fifo`,
      SNS_ENDPOINT: config.LOCAL_AWS.SNS_ENDPOINT
    })
  };
  variables.REPO_NAME_MAP.forEach((service) => {
    if (currentConfig[service.url] && findPort(service.name)) {
      envUpdate[service.url] = `http://localhost:${findPort(service.name)}`;
    }
  });
  variables.DDB_TABLE_NAME_MAP.forEach((table) => {
    if (currentConfig[table.envTableName]) {
      envUpdate[table.envTableName] = table.localTableName;
    }
  });
  variables.CRM_CONFIG.forEach((crm) => {
    if (currentConfig[crm.filedName]) {
      envUpdate[crm.filedName] = crm.value;
    }
  });
  update(currentConfig, source, envUpdate);
  console.log(themes.message(`>------>> [${repoName}] basic env modified!`));
};

exports.updateSQS = (source, repoName) => {
  const env = fs.readFileSync(`${source}/.env`);
  const buf = Buffer.from(env);
  const currentConfig = dotenv.parse(buf);
  let envUpdate = { ...currentConfig };

  Object.keys(currentConfig).forEach((element) => {
    variables.WORKER_URL_MAP.forEach((obj) => {
      if (obj.name === element) {
        envUpdate[obj.name] = obj.sqsUrl;
      }
    });
  });
  update(currentConfig, source, envUpdate);
  console.log(themes.message(`>------>> [${repoName}]  SQS url added in env!`));
};

exports.updateSpecialChanges = (source, repoName) => {
  const env = fs.readFileSync(`${source}/.env`);
  const buf = Buffer.from(env);
  const currentConfig = dotenv.parse(buf);
  let envUpdate = { ...currentConfig };

  variables.SPECIAL_CHANGES.forEach((service) => {
    for (const [_key, value] of Object.entries(service)) {
      if (repoName.includes(value["NAME"])) {
        value["KEYS"].forEach((element) => {
          if (currentConfig[element.filedName]) {
            envUpdate[element.filedName] = element.value;
          }
        });
      }
    }
  });
  update(currentConfig, source, envUpdate);
  console.log(themes.message(`>------>> [${repoName}]  Special changes done in env!`));
};

function update(currentConfig, dir, config = {}) {
  const envContents = Object.entries({ ...currentConfig, ...config })
    .map(([key, val]) => `${key}=${val}`)
    .join(os.EOL);
  fs.writeFileSync(dir + "/.env", envContents);
}
