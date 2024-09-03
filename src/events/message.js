const client = require("../index.js");
const { config, logger, ai } = require("../../utils/bot.js");
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
                if (cmd == "groq") {
                    return command.run(client, message, args, chat);
        
                } else if (cmd != "groq") {
                    return await chat.sendMessage("Kamu sedang di state groq, gunakan \"" + client.prefix[0] + "groq\" untuk keluar dari state ini!")
                }
            } else {
                const result = await ai.groq(message.body, chat.lastMessage.from.replace("@c.us", ""))
                await chat.sendMessage(result)
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
    
    client.msg = {
        number: await chat.lastMessage.from.replace("@c.us", ""),
    }
	command.run(client, message, args, chat);

});
