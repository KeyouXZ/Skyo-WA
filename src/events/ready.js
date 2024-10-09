const client = require('../index');
const { logger } = require("../../utils/bot")

client.on("ready", async () => {
    client.number = client.info.wid.user;
    logger.info(`Connected to%%`, client.number + "%%");
});