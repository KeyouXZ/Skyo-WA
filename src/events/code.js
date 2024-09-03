const client = require("../index");
const chalk = require("chalk");
const { config, logger } = require("../../utils/bot");
const qrcode = require('qrcode-terminal');

client.on('qr', (qr) => {
    const timestamp = new Date().toLocaleString('en-US', { hour12: false }).replace(',', '');
    
    logger.info('Generating QR Code...')

    qrcode.generate(qr, { small: true });
});