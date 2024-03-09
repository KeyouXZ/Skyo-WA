const client = require('../index');
const chalk = require("chalk");
const { config } = require("../../utils/bot")

client.on("ready", () => {
    const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');

    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Connected to`, chalk.yellow(config["phoneNumber"]));
});