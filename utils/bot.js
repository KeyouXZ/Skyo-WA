require("dotenv").config();
const chalk = require("chalk");
const { userSchema } = require("../database/schema")
const timestamp = new Date().toLocaleString("en-US", { hour12: false }).replace(",", "");
const fs = require('fs');
const path = require('path');
const { ChatGroq } = require("@langchain/groq");

const database = {
    createUser: async function (ID, name, username, password) {
        const user = new userSchema({ ID }, name, username, password);
        await user.save();
        return console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `User with ID ${ID} has been created`);
    },
    get: async function (ID) {
        return await userSchema.fidOne({ ID });
    },
    getAll: async function () {
        return await userSchema.find();
    },
    save: async function (ID, update) {
        return await userSchema.updateOne({ ID }, update)
    }
}

const cooldowns = {
    set: async function (client, message) {
        const prefixes = client.prefix
        const prefix = prefixes.find(p => message.body.startsWith(p));

        const regex = /"([^"]+)"|\S+/g;
        const args = message.body.slice(prefix.length).match(regex).shift().toLowerCase();
        let cooldownTime = client.commands.get(args).cooldown * 1000 || 15 * 1000

        // Set cooldown
        client.cooldown.set(client.msg["number"], Date.now() + cooldownTime)
    },
    has: async function(client, message) {
        const expirationTime = client.cooldown.get(client.msg["number"]) || 0;
        // Check cooldown
        if (Date.now() < expirationTime) {
            const timeLeft = (expirationTime - Date.now()) / 1000
            await message.reply(`⏱ | Harap tunggu dan coba perintahnya lagi *dalam ${timeLeft.toFixed()} detik*`)

            .then(msg => {
                setTimeout(async () => {
                   await msg.delete(true);
                }, timeLeft.toFixed() * 1000)
            });
            return true
        } else {
            return false
        }
    }
}

const readline = {
    create: function (client) {
        const readline = require("readline");
        
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: ": ",
        });

        let sigintCount = 0;

        rl.on("SIGINT", () => {
            sigintCount++;
            if (sigintCount === 1) {
                console.log("Are you sure you want to exit? Press CTRL-C again to confirm.");
                setTimeout(() => {
                    sigintCount = 0;
                }, 3000);
            } else {
                console.log("Exiting...");
                rl.close();
                process.exit(1);
            }
        });

        rl.on("line", async (input) => {
            switch (input) {
                case "help":
                    console.log(chalk.yellow(`Commands\nhelp, system, clear, exit`));
                    break;
                    
                case "system":
                    console.log("Node:", chalk.yellow(process.version), "\nDevice:", chalk.yellow(process.platform, process.arch), "\nMemory:", chalk.yellow((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)), "MB\nRSS:", chalk.yellow((process.memoryUsage().rss / 1024 / 1024).toFixed(2)), `MB`);
                    break;
                    
                case "clear":
                    console.clear();
                    break;
                
                case "exit":
                    console.log("Received exit command, Shutting Down...");
                    rl.close();
                    process.exit(1);
                    break;
                    
                default:
                    console.log(chalk.red.bold(`Invalid command ${input}. Type help for all commands!`));
                    break;
            }
        });
    },
};

const util = {
    temp: {
        /**
         * 
         * @param {*} m Message variable from whatsapp-web.js
         * @param {string} message New message "Send Me"
         * @param {number} timeout New timeout in second
         */ 
        reply: async function(m, message, timeout) {
            const time = timeout * 1000 || 15000
            await m.reply(message).then(msg => {
                setTimeout(() => {
                    msg.delete(true);
                }, time);
            });
        },
        sendMessage: async function (m, message, timeout) {
            const time = timeout * 1000 || 15000
            await m.sendMessage(message).then(msg => {
                setTimeout(() => {
                    msg.delete(true);
                }, time);
            });
        }
    },
}

const config = {
    get: function (env) {
        if (!process.env[env]) {
            return console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Env not found: ${env}`));
        }
        return process.env[env];
    },
    "prefix": [`${process.env.PREFIX}`, "!"],
    "developer": ["Keyou"],
    "currency": "Sc."
};

const logger = {
    info: function(...message) {
        const fixedMessage = message.join(" ").replace(/%%(.*?)%%/g, (_, match) => chalk.yellow.bold(match));
        return console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), fixedMessage)
    },
    error: function(...message) {
        message = message.join(" ")
        console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR`), chalk.red(message));
    },
    warn: function(...message) {
        message = message.join(" ")
        console.log(chalk.gray(`[${timestamp}]`), chalk.yellow.bold(`WARN`), chalk.yellow(message));
    }
}
    
const ai = {
    groq: async function (message, userId) {
        const chatHistoryFile = path.join('.data/chatHistory.json');
        const llm = new ChatGroq({
            groqApiKey: config.get("GROQ_API_KEY"),
            model: "mixtral-8x7b-32768",
            temperature: 1,
            maxTokens: undefined,
            maxRetries: 2,
        });

        let chatHistory = [];

        if (fs.existsSync(chatHistoryFile)) {
            const data = fs.readFileSync(chatHistoryFile, 'utf8');
            const allChatHistories = JSON.parse(data);
            chatHistory = allChatHistories[userId] || [];
        }

        // Ensure message content is a string
        if (typeof message !== 'string') {
            throw new Error('Message must be a string');
        }

        chatHistory.push({ role: 'user', content: message });

        try {
            const formattedHistory = chatHistory.map(({ role, content }) => {
                if (typeof content === 'object') {
                    if (content.kwargs && typeof content.kwargs.content === 'string') {
                        content = content.kwargs.content;
                    } else {
                        content = JSON.stringify(content);
                    }
                }
                if (typeof content !== 'string') {
                    logger.warn('Non-string message content detected:', content);
                    content = '';
                }
                return [role, content];
            });

            // Generate AI response
            const aiMsg = await llm.invoke([
                ...formattedHistory,
                ["human", message],
            ]);

            chatHistory.push({ role: 'assistant', content: aiMsg });

            let allChatHistories = {};
            if (fs.existsSync(chatHistoryFile)) {
                const data = fs.readFileSync(chatHistoryFile, 'utf8');
                allChatHistories = JSON.parse(data);
            }

            allChatHistories[userId] = chatHistory;

            fs.writeFileSync(chatHistoryFile, JSON.stringify(allChatHistories, null, 2));

            return aiMsg["content"];
        } catch (error) {
            logger.error('Error:', error);
            return "Failed to contact the API";
        }
    },
    flux: async function (message, phoneNumber) {
        try {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
                {
                    headers: {
                        Authorization: `Bearer ${config.get("FLUX_API_KEY")}`,
                        "Content-Type": "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({ "inputs": message?.toString() }),
                }
            );
            const preResult = await response.arrayBuffer();
            const result = Buffer.from(preResult);       

            const fileName = `${phoneNumber}#${Math.floor(Math.random() * 1000000)}.png`;
            const imagePath = path.join('.data', 'flux', fileName)

            fs.mkdirSync('.data/flux', { recursive: true });
            fs.writeFileSync(imagePath, result);

            return imagePath;
        } catch (error) {
            logger.error(error);
            return null;
        }
    }
}

module.exports = {
    readline,
    config,
    util,
    database,
    cooldowns,
    logger,
    ai
};
