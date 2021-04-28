var Utils = require('./utils')

var BLOCK_CHAR = {
    BB: '<td class="td-qr dark"></td>',
    WB: '<td class="td-qr"><div class="div-qr light"></div><div class="div-qr dark"></div></td>',
    WW: '<td class="td-qr light"></td>',
    BW: '<td class="td-qr"><div class="div-qr dark"></div><div class="div-qr light"></div></td>'
}

var INVERTED_BLOCK_CHAR = {
    BB: ' ',
    BW: '▄',
    WW: '█',
    WB: '▀'
}

function getBlockChar(top, bottom, blocks) {
    if (top && bottom) return blocks.BB
    if (top && !bottom) return blocks.BW
    if (!top && bottom) return blocks.WB
    return blocks.WW
}

exports.render = function(qrData, options, cb) {
    var opts = Utils.getOptions(options)
    var blocks = BLOCK_CHAR
    if (opts.color.dark.hex === '#ffffff' || opts.color.light.hex === '#000000') {
        blocks = INVERTED_BLOCK_CHAR
    }

    var size = qrData.modules.size
    var data = qrData.modules.data

    var output = ''
    output += '<table style="border-collapse: collapse;margin: auto;">'

    var margin = '<tr class="tr-qr"><td class="td-qr light"></td>'
    for (var i = 0; i < size; i++) {
        margin += '<td class="td-qr light"></td>'
    }
    margin += '<td class="td-qr light"></td></tr>'

    output += margin

    for (var i = 0; i < size; i += 2) {
        output += '<tr class="tr-qr">'
        output += '<td class="td-qr light"></td>'

        for (var j = 0; j < size; j++) {
            var topModule = data[i * size + j]
            var bottomModule = data[(i + 1) * size + j]

            output += getBlockChar(topModule, bottomModule, blocks)
        }

        output += '<td class="td-qr light"></td>'
        output += '</tr>'
    }
    output += margin
    output += '</table>'

    if (typeof cb === 'function') {
        cb(null, output)
    }

    return output
}

exports.renderToFile = function renderToFile(path, qrData, options, cb) {
    if (typeof cb === 'undefined') {
        cb = options
        options = undefined
    }

    var fs = require('fs')
    var utf8 = exports.render(qrData, options)
    fs.writeFile(path, utf8, cb)
}