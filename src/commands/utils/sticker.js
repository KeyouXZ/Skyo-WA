const { cooldowns } = require("../../../utils/bot")

module.exports = {
    name: "sticker",
    description: "Change image/video into sticker",
    cooldown: 20,
    usage: ["<sticker name> <sticker author> [sticker category]"],
    run: async (client, message, args, chat) => {
        if (await cooldowns.has(client, message)) { return; }

        try {
            // Download image if the message has media
            const target = await message.getQuotedMessage() || message;
                
            if (target.hasMedia) {    
                const media = await target.downloadMedia();            
                // Handle sticker name, author
                const stickerName = args[0];
                const stickerAuthor = args[1];
                if (!stickerName) {
                    return await chat.sendMessage("Masukan nama stiker");
                } else if (!stickerAuthor) {
                    return await chat.sendMessage("Masukan pembuat stiker");
                }

                // Check if the media is an image or video
                if (media?.mimetype.startsWith('video')) {
                    // Send the sticker
                    return chat.sendMessage("Video ke stiker tidak di support")

                } else if (media?.mimetype.startsWith('image')) {
                    cooldowns.set(client, message)
                    return await chat.sendMessage(media, {
                        sendMediaAsSticker: true,
                        stickerAuthor,
                        stickerName
                    });
                } else {
                    // Handle unsupported media type
                    return chat.sendMessage(`Media tidak disupport`);
                }
            } else {
                // Handle case where the message has no media
                return chat.sendMessage("Balas pesan ke gambar atau video untuk membuat stiker");
            }
        } catch (error) {
            // Handle errors
            chat.sendMessage("Error saat memproses command stiker. silahkan coba lagi nanti!");
        }
    }
}