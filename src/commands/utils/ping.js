const { cooldowns } = require("../../../utils/bot")

module.exports = {
    name: "ping",
    cooldown: 15,
    run: async (client, message, args) => {
        if (await cooldowns.has(client, message)) { return; }

        cooldowns.set(client, message)
        await message.reply("Pong")
    }
}