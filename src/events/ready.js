const client = require('../index');
const chalk = require("chalk");
const { config, logger } = require("../../utils/bot")

client.on("ready", async () => {
    const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');

    logger.info(`Connected to%%`, config["phoneNumber"] + "%%");
});