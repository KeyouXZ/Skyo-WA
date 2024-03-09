const fs = require("fs");
const chalk = require('chalk');
const mongoose = require("mongoose")
const url = process.env.MONGO_URL;

const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');

module.exports = async (client) => {
    // Load events
    const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Loading events...`);
  
    let loadedEvents = 0;
    fs.readdirSync('./src/events/').filter((files) => files.endsWith('.js')).forEach((event) => {
        try {
            require(`../events/${event}`);
            loadedEvents++;
        } catch (error) {
            console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Unable to load file ${event.replace('.js', '')}: ${error.message} ${error.stack}`));
            process.exit(1);
        }
    });

    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), chalk.yellow.bold(loadedEvents), 'events loaded');
    
    // Load commands
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Loading commands...`);
  
    fs.readdirSync('./src/commands/').forEach(dir => {
        const files = fs.readdirSync(`./src/commands/${dir}/`).filter(file => file.endsWith('.js'));
        files.forEach((file) => {
            let command = require(`../commands/${dir}/${file}`);
            if (command) {
                client.commands.set(command.name, command);
                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => {
                        client.aliases.set(alias, command.name);
                    });
                }
                // 
            }
        });
    });
    console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), chalk.yellow.bold(client.commands.size), 'commands loaded');

     // Load MongoDB
     mongoose.set('strictQuery', false);
     try {
         console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Connecting to MongoDB...`);
         await mongoose.connect(url)
         .then(c => {
              console.log(chalk.gray(`[${timestamp}]`), chalk.blue.bold(`INFO`), `Connected to MongoDB`)
         });
     } catch (err) {
         console.log(chalk.gray(`[${timestamp}]`), chalk.red.bold(`ERROR Failed to connect to MongoDB: ${err.msg} ${err.stack}`));
         process.exit(1);
     }
};