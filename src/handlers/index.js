const fs = require("fs");
const path = require("path")
const mongoose = require("mongoose")
const url = process.env.MONGO_URL;
const { logger } = require("../../utils/bot")

module.exports = async (client) => {
    if (fs.existsSync(path.join(".data/chatHistory.json"))) {
        fs.unlinkSync(path.join(".data/chatHistory.json"));
        logger.info('All chat histories have been reset');
    }
    // Load events
    logger.info("Loading events...")
  
    let loadedEvents = 0;
    fs.readdirSync('./src/events/').filter((files) => files.endsWith('.js')).forEach((event) => {
        try {
            require(`../events/${event}`);
            loadedEvents++;
        } catch (error) {
            logger.warn("Unable to load file", event.replace('.js', '') + ":", error.message, error.stack)
            process.exit(1);
        }
    });

    logger.info(`%%${loadedEvents}%% events loaded`)
    
    // Load commands
    logger.info("Loading commands...")
  
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
    logger.info(`%%${client.commands.size}%% commands loaded`)

     // Load MongoDB
    mongoose.set('strictQuery', false);
    try {
        logger.info("Connecting to MongoDB")
        await mongoose.connect(url)
        .then(c => {
             logger.info("Connected to MongoDB")
        });
    } catch (err) {
        logger.error("Failed to connect to MongoDB", err.msg, err.stack)
        process.exit(1);
    }
};