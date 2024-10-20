const client = require("../index.js");
const { config, logger, ai } = require("../../utils/bot.js");
const prefixes = client.prefix;

// User state
client.userState = new Map();

client.on("message", async (message) => {
    // Chat
    const chat = await message.getChat();

    // Exstra protection
    const messageDate = new Date(message.timestamp * 1000); 
    const now = new Date();

    if (messageDate < now - (10 * 1000)) {
        return;
    }

    // Number
    const _last = chat.lastMessage.from
    const number = _last.includes("@c.us") ? _last.replace("@c.us", "") : chat.lastMessage.author.replace("@c.us", "");
    const grup = _last.includes("@g.us") ? _last.replace("@g.us", "") : null

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
    const cmd = args.shift()?.toLowerCase();
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
                const result = await ai.groq(message.body, number)
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
        number,
        grup
    }
	command.run(client, message, args, chat);

});
