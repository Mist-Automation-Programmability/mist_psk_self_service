const config = require("../config")
const nodemailer = require("nodemailer")
const fs = require('fs')
const mist_qrcode = require("./mist_qrcode")

function generateEmail(name, ssid, psk, cb) {
    qr_info = "You can also scan the QRCode below to configure your device:"
    mist_qrcode.generateQrCode(ssid, psk, (qr_code) => {
        fs.readFile(global.appPath + '/email.html', (err, data) => {
            if (err) {
                console.error(err)
                cb(err)
            } else {
                data = data.toString()
                    .replace("{logo}", config.smtp.logo_url)
                    .replace("{name}", name)
                    .replace("{ssid}", ssid)
                    .replace("{psk}", psk)
                    .replace("{qr_info}", qr_info)
                    .replace("{qr_code}", qr_code)
                cb(null, data)
            }
        })
    })
}

module.exports.send = function(email, name, ssid, psk, cb) {
    var smtp = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: config.smtp.auth,
        tls: config.smtp.tls
    });

    generateEmail(name, ssid, psk, (err, html) => {
        if (html) {
            var message = {
                from: config.smtp.from_name + " <" + config.smtp.from_email + ">",
                to: email,
                subject: config.smtp.subject,
                html: html
            };
            smtp.sendMail(message, cb)
        }
    })
};