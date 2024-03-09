const client = require("../index");
const chalk = require("chalk");

client.on('code', (code) => {
    const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
        
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Pairing code:`, chalk.yellow(code));
});