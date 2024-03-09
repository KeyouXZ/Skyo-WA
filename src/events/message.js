const client = require("../index.js");
const { config } = require("../../utils/bot.js");
const axios = require("axios")
const prefixes = client.prefix;

// User state
client.userState = new Map();

client.on("message", async (message) => {
    // Number
    const number = await message.getMentions().number

    // Prefixes
    const prefix = prefixes.find(p => message.body.startsWith(p));
    if (!prefix && client.userState.get(number) != "chatbot") return;

    // Args
    // const args = message.body.slice(prefix?.length).trim().split(/ +/g);
    const regex = /"([^"]+)"|\S+/g;
    const args = message.body.slice(prefix?.length).match(regex);

    // Commands 1
    const cmd = args.shift().toLowerCase();
    if (cmd.length == 0) return;
    let command = client.commands.get(cmd);

    // Define chat
    const chat = await message.getChat();

    // Chat Bot
    if (client.userState.has(number)) {
        if (client.userState.get(number) == "chatbot") {
            if (prefix) {
                if (cmd == "bot") {
                    return command.run(client, message, args, chat);
    
                } else if (cmd != "bot") {
                    return await chat.sendMessage("You currently in chat bot state, using \"" + client.prefix[0] + "bot\" to exit current state")
                }
            } else {

                // Request to brainshop
                const bid = '180584';
                const key = "le2O9v0frYI972vH";
                const uid = await number
                
                await axios.get(`http://api.brainshop.ai/get?bid=${bid}&key=${key}&uid=${uid}&msg=${encodeURIComponent(message.body)}`).then(async response => {
                    return await chat.sendMessage(response.data.cnt);
                })
            }
        }
    } else {
        client.userState.set(number, 'none')
    }

    // Commands 2
    if (!command?.run) return;
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) {
        // Developers command
        if (!client.dev.has(command.name)) {
            client.dev.set(command.name, new Map())
        }
        // if (command.isDev && data.isDeveloper == false) {
        //     return;
        // }
    }

    // Run command
	command.run(client, message, args, chat);

});