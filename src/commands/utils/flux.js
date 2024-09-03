const { cooldowns } = require("../../../utils/bot");
const { MessageMedia } = require('whatsapp-web.js');
const { ai } = require("../../../utils/bot");
const path = require("path");
const fs = require("fs");

module.exports = {
    name: "flux",
    usage: ["<prompt>"],
    cooldown: 20,
    run: async (client, message, args, chat) => {
        if (await cooldowns.has(client, message)) { return; }

        const msg = args.slice(0).join(' ');
        if (!msg) {
            return await chat.sendMessage("Prompt tidak boleh kosong");
        }

        const location = await ai.flux(msg, client.msg["number"]);
        const media = MessageMedia.fromFilePath(location);

        await chat.sendMessage(media, { caption: msg });
        cooldowns.set(client, message)
    }
};
