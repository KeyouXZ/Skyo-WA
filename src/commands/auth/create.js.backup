const { util, database } = require("../../../utils/bot");
const path = require("path");
const fs = require("fs");

module.exports = {
    name: "create",
    description: "Create new user",
    usage: "<name> <password> [username]",
    docs: ["Name: Your name and must be 5-15 character\nPassword: Your password and must be 5-15 character\nUsername (optional): Your Username, default: your name"],
    run: async (client, message, args, chat) => {
        // Get last ID
        // Write if file doesn't exists 
        const dirPath = "./local"
        const filePath = dirPath + "/lastid";
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '0', 'utf-8');
        }
        
        // Read last id
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lastId = parseInt(fileContent);
        
        const ID = lastId + 1;
        const name = args[0].toLowerCase();
        const password = args[1]
        const username = args[2] ? args[2] : name

        if (name || password) {
            if (name <= 5 && name >= 15) {
                return await util.temp.reply(message, "Name must be 5-15 character")
            } else if (password <= 5 && password >= 15) {
                return await util.temp.reply(message, "Name must be 5-15 character")
            }
            // Logic to create new user

        } else if (!name) {
            return await util.temp.reply("Name cannot be empty")
        } else if (!password) {
            return await util.temp.reply("Password cannot be empty")
        }

        const user = {
            ID,
            name,
            username,
            password
        }


        
        
        
        // Write new id 
        fs.writeFileSync(filePath, ID.toString(), 'utf-8');
    }
}