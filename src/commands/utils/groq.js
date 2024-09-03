const fs = require("fs");
const path = require("path")

module.exports = {
    name: "groq",
    run: async (client, message, args, chat) => {
        const state = client.userState.get(client.msg.number)

        if (state == "chatbot") {
            client.userState.set(client.msg.number, 'none')

            const chatHistoryFile = path.join('local/chatHistory.json');

            const userId = client.msg["number"]
            if (fs.existsSync(chatHistoryFile)) {
                const data = fs.readFileSync(chatHistoryFile);
                let allChatHistories = JSON.parse(data);
    
                if (allChatHistories[userId]) {
                    delete allChatHistories[userId];
    
                    fs.writeFileSync(chatHistoryFile, JSON.stringify(allChatHistories, null, 2));
                }
            }

            return await chat.sendMessage("Keluar dari groq state")
        } else {
            client.userState.set(client.msg.number, "chatbot")


            return await chat.sendMessage("Groq state diaktifkan, kamu bisa berbicara dengan groq sekarang")
        }
    }
};
