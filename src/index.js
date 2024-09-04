const { Client, LinkingMethod, LocalAuth } = require('whatsapp-web.js');
const { readline, config } = require("../utils/bot");
const chalk = require("chalk");
const fs = require("fs")

require("dotenv").config();

// Create new client
const client = new Client({
    // Save whatsapp session
    authStrategy: new LocalAuth({
        dataPath: './local/auth',
        clientId: "client"
    }),

    puppeteer: {
        headless: true,
        executablePath: process.env.CHROME_PATH || null,
    }
});

// Define some variable
client.prefix = config["prefix"];
client.commands = new Map();
client.aliases = new Map();

client.msg = {}
client.cooldown = new Map();
client.premium = new Map();
client.dev = new Map();
client.loginMap = new Map();

// Export client
module.exports = client;

// Handlers
fs.readdirSync("./src/handlers/").forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

// Login
client.initialize();

// Create terminal
readline.create(client);

// Error handlers
const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
process.on("unhandledRejection", (reason, p) => {
    console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Unhandled Rejection: ${reason.stack}`));
});

process.on("uncaughtException", (err, origin) => {
    console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Uncaught Exception: ${err.stack}`));
});
