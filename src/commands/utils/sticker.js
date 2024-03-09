module.exports = {
    name: "sticker",
    description: "Change image/video into sticker",
    cooldown: 20,
    usage: ["<sticker name> <sticker author> [sticker category]"],
    run: async (client, message, args, chat) => {
        try {
            // Download image if the message has media
            const target = await message.getQuotedMessage() || message;
                
            if (target.hasMedia) {    
                const media = await target.downloadMedia();            
                // Handle sticker name, author
                const stickerName = args[0];
                const stickerAuthor = args[1];
                if (!stickerName) {
                    return await chat.sendMessage("Please specify sticker name");
                } else if (!stickerAuthor) {
                    return await chat.sendMessage("Please specify sticker author");
                }

                // Check if the media is an image or video
                if (media?.mimetype.startsWith('video')) {
                    // Send the sticker
                    return chat.sendMessage("Video to sticker currently is not supported")
                } else if (media?.mimetype.startsWith('image')) {
                    return await chat.sendMessage(media, {
                        sendMediaAsSticker: true,
                        stickerAuthor,
                        stickerName
                    });
                } else {
                    // Handle unsupported media type
                    return chat.sendMessage(`Unsupported media type.`);
                }
            } else {
                // Handle case where the message has no media
                return chat.sendMessage("Please reply to an image or video to create a sticker.");
            }
        } catch (error) {
            // Handle errors
            chat.sendMessage("Error processing sticker command. Please try again later.");
        }
    }
}