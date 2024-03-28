const client = require("../index.js");
const { config } = require("../../utils/bot.js");
const axios = require("axios")
const prefixes = client.prefix;

// User state
client.userState = new Map();

client.on("message", async (message) => {
    // Chat
    const chat = await message.getChat();
    // Number
    const number = await chat.lastMessage.from.replace("@c.us", "");

    // Prefixes
    const prefix = prefixes.find(p => message.body.startsWith(p));
    if (!prefix && client.userState.get(number) != "chatbot") return;

    // Args
    // const args = message.body.slice(prefix?.length).trim().split(/ +/g);
    const regex = /"([^"]*)"|\S+/g;
    const args = [];
    let match;

    while ((match = regex.exec(message.body.slice(prefix?.length))) !== null) {
        args.push(match[1] || match[0]);
    }

    // Commands 1
    const cmd = args.shift().toLowerCase();
    if (cmd.length == 0) return;
    let command = client.commands.get(cmd);

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

                const cai_api = process.env.CAI_API;
		const cai_password = process.env.CAI_PASSWORD;
		const cai_message = message.body;
                
                await axios.post(cai_api, {password: cai_password, message: cai_message}).then(async response => {
		    let result = response.data.text
		    if (result.includes("```")) result.replace("```", "")
                    return await chat.sendMessage(result);
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
