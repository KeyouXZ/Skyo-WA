const { MessageMedia } = require("whatsapp-web.js")
const fs = require('fs');
const path = require('path');

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
    usage: ["<url>", "<url> audio"],
    run: async (client, message, args, chat) => {
        const api = "https://api.tiklydown.eu.org/api/download/v2?url="
        
        // Check api 
        if (!fetch(api)) {
            return await message.reply("API Error. Hubungi developer jika berkenan!")
        }
        
        // Get URL & Option
        const url = args[0];
        if (!url) return await message.reply("URL tidak boleh kosong!")

        fs.mkdirSync('.data/tiktok', { recursive: true });
        filePath = path.join(`.data/tiktok/${client.msg["number"]}#${Math.floor(Math.random() * 1000000)}`)
        
        const opt = args[1];
        let mode = "normal"
        if (!opt) {
            mode = "normal"
        } else if (opt == "audio") {
            mode = "music"
        } else {
            return await  message.reply("Opsi tidak tersedia: " + opt)
        }
        
        await message.reply("Memproses...")
        
        // Request to API
        try {
            const response = await fetch(api + url)
            const data = await response.json()
            
            if (await data["status"] != 200) {
                return await message.reply("Video tiktok tidak ditemukan")
            }
            
            if (mode == "normal" && data["result"]["type"] == "video") {
                filePath += ".mp4"
                await downloadVideo(data["result"]["video1"], filePath)

                const media = MessageMedia.fromFilePath(filePath)
                return await chat.sendMessage(media, { caption: `Pembuat: ${data["result"]["author"]["nickname"]}\nDeskripsi: ${data["result"]["desc"]}`})
            } else if (mode == "music" && data["result"]["type"] == "video") {
                filePath += ".mp3"
                await downloadVideo(data["result"]["music"], filePath)
                const media = MessageMedia.fromFilePath(filePath)
                return await chat.sendMessage(media)
            }
        } catch (err) {
            await chat.sendMessage(err)
        }
    }
}