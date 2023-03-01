const chalk = require("chalk");
module.exports = {
    error: chalk.bold.red,
    success: chalk.bold.green,
    message: chalk.yellowBright,
    finishSingle: chalk.bold.bgGreen,
    startHeader: chalk.bold.bgBlue,
    startSubHeader: chalk.bold.bgMagenta
}