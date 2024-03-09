const fs = require('fs');
const ytdl = require('ytdl-core');
const { util } = require("../../../utils/bot")
const NodeID3 = require("node-id3")

module.exports = {
    name: "youtube",
    description: "Download youtube video into mp3/mp4 format",
    aliases: ["yt"],
    usage: ["mp3 <url> [title] [artist]", "mp4 <url> [title]"],
    cooldown: 30,
    run: async (client, message, args, chat) => {
        const format = args[0];
        const url = args[1];
        
        // Handle format
        if (!format) {
            return await util.temp.reply(message, "Please specify format [mp3/mp4]");
        }
        
        if (!url) {
            return await util.temp.reply(message, "Please provide a URL");
        }
        
        if (format == "mp3" || format == "mp4") {
            try {
                const info = await ytdl.getInfo(url);
                const ttitle = info.videoDetails.title
                
                // If mp3 audio
                if (format == "mp3") {
                    const artist = args[2] || 'Unknown';
                    let title = args[3] || ttitle;
                    if (args[3] == "-") {
                        title = ttitle;
                    }
                    // Stream
                    const stream = ytdl(url, {quality: 'highestaudio'})
                    // Save file
                    const writer = fs.createWriteStream(`./local/youtube/${title}.mp3`);
                    
                    stream.pipe(writer);

                    writer.on('finish', () => {
                        // Edit ID3 tags
                        const tags = {
                            title: title,
                            artist: artist,
                        };

                        const success = NodeID3.write(tags, `${title}.mp3`);
                        
                        // Send result
                        if (success) {
			    const audioFilePath = `./local/youtube/${title}.mp3`
                            const media = fs.readFileSync(audioFilePath) // Code for gets media by file
                            return chat.sendMessage(media, { sendMediaAsDocument: true });
                        } else {
                            return chat.sendMessage(`Error updating ID3 tags for ${title}`);
                        }
                    })
                }

                // For mp4
                if (format == "mp4") {
                    return chat.sendMessage("Sorry, this format is not available. Currently work on this format")
                }
            } catch (error) {
                await chat.sendMessage("Can't find youtube video with provided URL ");
            }
        }
    }
};
