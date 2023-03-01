module.exports = {
  ROOT_DIR: `ServiceXOS2`,
  REPOS: `Repos`,
  SRC_DIR_NAME: `src`,
  ENV_FILE_DEV: `.env.dev`,
  ENV_FILE_LOCAL: `.env`,
  REPO_TYPE: { SERVICE: `service`, WORKER: `worker`, ADAPTER: `adapter` },
  GIT_BASE_BRANCH: `develop`,
  HELPERS_REPO: `HELPERS`,
  DOMAINS:["ab", "cd", "ef", "gh"],
  HELPERS: {
    NAME: `abc-helpers`
  },
  REPO_NAME_MAP: [
    //Service & Adapter only, Find in env.dev, & map for local .env
    {
      url: "DOMAIN_ABC_SERVICE_URL", //url in .env.dev
      name: "domain-abc-service" //url in local e.g localhost:8081
    }
  ],
  WORKER_URL_MAP: [
    {
      name: "DOMAIN_ABC_SQS", //name in .env.dev
      sqsUrl:
        "http://localhost:4566/000000000000/domain-abc-service-worker-sqs.fifo" // generated url in local e.g localstack
    }
  ],
  DDB_TABLE_NAME_MAP: [
    {
      envTableName: "COUNTRY_TABLE", // name in .env.dev
      localTableName: "countries" // name in local ddb
    }
  ],
  CRM_CONFIG: [
    {
      filedName: "CRM_API_VERSION", //name in .env.dev
      value: "v9.0" //value for local .env
    }
  ],
  RUN_TYPE: {
    NODE: `node`,
    NODEMON: `nodemon`
  },
  SPECIAL_CHANGES: [
    {
      ABC_ADAPTER: {
        NAME: "domain-abc-adapter",
        KEYS: [
          {
            filedName: "APEXX_ORG_ID_SUBS", // in .env.dev
            value: "dd2bb5ccA6e55A4a83A9af7A08650f52d06a" //value in .env.dev
          }
        ]
      }
    }
  ]
};
