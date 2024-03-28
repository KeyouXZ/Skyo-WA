const { cooldowns } = require("../../../utils/bot")

module.exports = {
    name: "ping",
    cooldown: 15,
    run: async (client, message, args, chat) => {
        if (await cooldowns.has(client, message)) { return; }

        cooldowns.set(client, message)
        await message.reply(" Pong")
        const name = await message.getMentions();
        console.log(await chat.lastMessage.from.replace("@c.us", ""))
    }
}
