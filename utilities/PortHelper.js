const fs = require("fs");

let portFile = require("./port.json");
const variables = require("./variables");

const portConfig = (initPort, port) => {
  const file = {
    initPort,
    assignedPort: port.assignedPort
  };
  fs.writeFileSync("./port.json", JSON.stringify(file, null, 2));
};
exports.getPort = (service) => {
  if (portFile.assignedPort[service]) {
    return portFile.assignedPort[service];
  }
  variables.DOMAINS.forEach((domain) => {
    if (service.includes(domain)) {
      return setPort(service, domain);
    }
  });
};
exports.findPort = (service) => {
  return portFile.assignedPort[service]
    ? portFile.assignedPort[service]
    : setPort(service, service.substring(0, 2));
};
const setPort = (service, domain) => {
  portFile.assignedPort[service] = portFile.initPort[domain];
  portFile.initPort[domain] = portFile.initPort[domain] + 1;
  portConfig(portFile.initPort, portFile);
  return portFile.assignedPort[service];
};
