module.exports = {
    name: "bot",
    run: async (client, message, args, chat) => {
        const number = await message.getMentions().number;

        const state = client.userState.get(number)

        if (state == "chatbot") {
            client.userState.set(number, 'none')
            return await chat.sendMessage("Exiting chat bot state")
        } else {
            client.userState.set(number, "chatbot")
            return await chat.sendMessage("Chat bot state activated, you can talk to bot now")
        }
    }
};
