var QRCode = require('./qrcode')

module.exports.generateQrCode = function(ssid, psk, cb) {
    QRCode.toString("WIFI:S:" + ssid + ";T:WPA;P:" + psk + ";;", function(err, data) {
        cb(data)
    })
}