// /*================================================================
// CUSTOM:
// endpoints used to dynamicly return customized colors
// ================================================================*/
const express = require('express');
const router = express.Router();


router.get("/", (req, res) => {
    if (req.session && req.session.mist.customization && req.session.mist.customization.logo && req.session.mist.customization.logo.url)
        res.json({ logo_url: req.session.mist.customization.logo.url })
    else res.json({ logo_url: "/images/juniper.png" })
})

function lightOrDark(color) {
    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        r = color[1];
        g = color[2];
        b = color[3];
    } else {
        // If RGB --> Convert it to HEX: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace(
            color.length < 5 && /./g, '$&$&'
        ));
        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp > 160) return '#555555';
    else return '#ffffff';
}

router.get("/colors.css", (req, res) => {
    res.set('Cache-Control', 'no-store')
    if (req.session.mist && req.session.mist.customization && req.session.mist.customization.colors) {
        var bg_color = req.session.mist.customization.colors.background
        var card_color = req.session.mist.customization.colors.card
        var primary_color = req.session.mist.customization.colors.primary
        var accent_color = req.session.mist.customization.colors.accent
    } else {
        var bg_color = "#ececec"
        var card_color = "#ffffff"
        var primary_color = "#005c95"
        var accent_color = "#84b135"
    }
    var css = "\
    body{background-color:" + bg_color + "!important;}\
    mat-toolbar>a{background-color:" + bg_color + "!important;color:" + lightOrDark(bg_color) + "!important}\
    mat-form-field{color:" + lightOrDark(bg_color) + "!important}\
    .toolbar{background-color:" + bg_color + "!important;}\
    .toolbar{color:" + lightOrDark(bg_color) + "!important;}\
    mat-card{background-color:" + card_color + "!important;}\
    mat-card,mat-card-subtitle{color:" + lightOrDark(card_color) + "!important;}\
    mat-card-actions>a,mat-card-actions>.mat-raised-button.mat-primary:not(.mat-button-disabled){background-color:" + primary_color + "!important;color:" + lightOrDark(primary_color) + "!important}\
    mat-card-actions>.mat-raised-button.mat-accent:not(.mat-button-disabled){background-color:" + accent_color + "!important;color:" + lightOrDark(accent_color) + "!important}\
    mat-card-actions>.mat-button.mat-primary:not(.mat-button-disabled){color:" + primary_color + "!important}\
    mat-card-actions>.mat-button.mat-accent:not(.mat-button-disabled){color:" + accent_color + "!important}\
    mat-dialog-container{background-color:" + card_color + "!important;}\
    mat-dialog-container{color:" + lightOrDark(card_color) + "!important;}\
    app-qrcode>div>.mat-raised-button.mat-accent:not(.mat-button-disabled){background-color:" + accent_color + "!important;color:" + lightOrDark(accent_color) + "!important}\
    .mat-simple-snackbar-action{color:" + primary_color + "!important;}"
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(css, 'utf-8');
    res.end();

})
module.exports = router;