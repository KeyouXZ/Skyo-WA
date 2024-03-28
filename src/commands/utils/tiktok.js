const { MessageMedia } = require("whatsapp-web.js")
const axios = require('axios');
const fs = require('fs');

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const downloadVideo = async (url, path) => {
    try {
        const command = `curl -sL "${url}" -o ${path}`;
        await execPromise(command);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
}

module.exports = {
    name: "tiktok",
    description: "Download TikTok Video without watermark",
    cooldown: 15,
    usage: ["<url>", "<url> hd", "<url> musiconly"],
    run: async (client, message, args, chat) => {
        const api = "https://api.nyx.my.id/dl/tiktok?url="
        
        // Check api 
        if (!fetch(api)) {
            return await message.reply("API not found, please DM Developer for more information!")
        }
        
        // Get URL & Option
        const url = args[0];
        if (!url) return await message.reply("URL cannot be empty!")
        
        const opt = args[1];
        let mode = "normal"
        if (!opt) {
            mode = "normal"
        } else if (opt == "hd") {
            mode = "hd"
        } else if (opt == "musiconly") {
            mode = "music"
        } else {
            return await  message.reply("Invalid option " + opt)
        }
        
        // Request to API
        try {
            const response = await fetch(api + url)
            const data = await response.json()
            
            if (await data["status"] == "false") {
                return await message.reply("Couldn't get tiktok video by given URL")
            }
            
            const dirPath = "./local/tiktok"
            let filePath = dirPath + "/" + await chat.lastMessage.from.replace("@c.us", "") + "#" + Math.floor(Math.random() * 99999)
            
            if (mode == "normal") {
                filePath += ".mp3"
                await downloadVideo(data["result"]["video1"], filePath)
                
                const media = MessageMedia.fromFilePath(filePath, { unsafeMime: true })
                return await chat.sendMessage(media, { caption: `Author: ${data["result"]["author"]["nickname"]}\nDescription: ${data["result"]["desc"]}`})
            } else if (mode == "hd") {
                filePath += ".mp3"
                await downloadVideo(data["result"]["video_hd"], filePath)
                
                const media = MessageMedia.fromFilePath(filePath, { unsafeMime: true })
                return await chat.sendMessage(media)
            } else if (mode == "music") {
                filePath += ".mp3"
                await downloadVideo(data["result"]["music"], filePath)
                const media = MessageMedia.fromFilePath(filePath, { unsafeMime: true })
                return await chat.sendMessage(media)
            }
        } catch (err) {
            await chat.sendMessage(err)
        }
    }
}