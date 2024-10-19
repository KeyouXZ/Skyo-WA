const { MessageMedia } = require("whatsapp-web.js")
const fs = require('fs');
const path = require('path');
const { cooldowns, logger } = require("../../../utils/bot")

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const Tiktok = require("@tobyg74/tiktok-api-dl")

const getTiktokData = async (url, ver) => {
    try {
        const result = await Tiktok.Downloader(url, {
            version: ver ? ver : "v3",
            proxy: "http"
        });
        return result;
    } catch (error) {
        logger.error('Error fetching TikTok data:', error);
    }
};



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

        if (await cooldowns.has(client, message)) { return; }
        
        // Get URL & Option
        const url = args[0];
        if (!url) return await message.reply("URL tidak boleh kosong!")

        fs.mkdirSync('.data/tiktok', { recursive: true });
        filePath = path.join(`.data/tiktok/${client.msg["number"]}#${Math.floor(Math.random() * 1000000)}`)
        
        const opt = args[1];
        let mode = "normal"
        if (!opt) {
            mode = "normal"
        } else if (opt == "hd") {
            mode = "hd"
        } else if (opt == "audio") {
            mode = "music"
        } else {
            return await  message.reply("Opsi tidak tersedia: " + opt)
        }
        
        await message.reply("Memproses...")
        
        // Request to API
        try {
            const data = await getTiktokData(url)
            
            if (data["status"] != "success") {
                return await message.reply("Video tiktok tidak ditemukan")
            }
            
            // Music
            let data1;
            if (mode == "music") {
                data1 = await getTiktokData(url, "v1")
            }
            if (mode == "music" && data1["status"] != "success") {
                return await message.reply("Video tiktok tidak ditemukan")
            }

            const videoRes = mode == "hd" ? data["result"]["videoHD"] : data["result"]["videoSD"]
            if (mode == "normal" && data["result"]["type"] == "video" && videoRes) {
                filePath += ".mp4"
                await downloadVideo(videoRes, filePath)

                const media = MessageMedia.fromFilePath(filePath)
                await cooldowns.set(client, message)

                return await chat.sendMessage(media, { caption: `Pembuat: ${data["result"]["author"]["nickname"]}\nDeskripsi: ${data["result"]["desc"]}`})
            } else if (mode == "music" && data1["result"]["type"] == "video" && data1["result"]["music"]["playUrl"]) {
                filePath += ".mp3"
                await downloadVideo(data1["result"]["music"]["playUrl"], filePath)
                const media = MessageMedia.fromFilePath(filePath)
                await cooldowns.set(client, message)

                return await chat.sendMessage(media)
            } else {
                return await message.reply("Tidak tersedia untuk saat ini!")
            }
        } catch (err) {
            await chat.sendMessage(err)
        }
    }
}