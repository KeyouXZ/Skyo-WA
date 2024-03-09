const { util } = require("../../../utils/bot");
const path =require("path")
const fs = require("fs")

module.exports = {
    name: "doc",
    description: "Get document from commands",
    usage: ["<command>"],
    run: async (client, message, args, chat) => {
        const command = args[0];
        if (!command) {
            return await util.temp.reply(message, "Command cannot be empty")
        }
        
        const headerPath = "./src/docs/header.js"
        const documentPath = "./src/docs/" + command + ".txt"
        if (fs.existsSync(headerPath)) {
            filePath = path.resolve(headerPath);
            delete require.cache[require.resolve(filePath)];

            // Get header text
            const headers = require("../../docs/header")
            let text = headers(client, command)

            // Read document if available
            if (fs.existsSync(documentPath)) {
                text += fs.readFileSync(documentPath, 'utf-8')
            } else text += "\r\r"

            // Send the document
            return await chat.sendMessage(text)
        } else if (!client.commands.has(command)) {
            return await chat.sendMessage("Command not found")
        } else {
            return await chat.sendMessage("Document not found on this command")
        }
    }
}