require("dotenv").config();
const chalk = require("chalk");
const { userSchema } = require("../database/schema")
const timestamp = new Date().toLocaleString("en-US", { hour12: false }).replace(",", "");

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
        client.cooldown.set(await message.getMentions().number, Date.now() + cooldownTime)
    },
    has: async function(client, message) {
        const expirationTime = client.cooldown.get(await message.getMentions().number) || 0;
        // Check cooldown
        if (Date.now() < expirationTime) {
            const timeLeft = (expirationTime - Date.now()) / 1000
            await message.reply(`⏱ | Please wait and try the command again *in ${timeLeft.toFixed()} seconds*`)
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
    "phoneNumber": process.env.COUNTRYCODE + process.env.NUMBER,
    "prefix": [`${process.env.PREFIX}`, "!"],
    "developer": ["Keyou"],
    "currency": "Kc."
};

module.exports = {
    readline,
    config,
    util,
    database,
    cooldowns
};
