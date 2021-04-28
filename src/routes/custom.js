// /*================================================================
// CUSTOM:
// endpoints used to dynamicly return customized colors
// ================================================================*/
// var express = require('express');
// var router = express.Router();
// var Account = require("../bin/models/account");

// /*================================================================
// FUNCTIONS
// ================================================================*/
// // generate default colors
// function defaultColors() {
//     return "var colors = {" +
//         "'50': '#e3f1fa', '100': '#badcf4', '200': '#90c7ed', '300': '#66b1e6', '400': '#47a1e2', '500': '#2892de', '600': '#2085d1', '700': '#1673bf', '800': '#0e63ad', '900': '#00468e', 'A100': '#82B1FF', 'A200': '#448AFF', 'A400': '#2979FF', 'A700': '#2962FF'," +
//         "'contrastDefaultColor': 'light'" +
//         "}";
// }
// // based on the main color, generate a lighter or darker color 
// function LightenDarkenColor(col, amt) {
//     var usePound = false;
//     if (col[0] == "#") {
//         col = col.slice(1);
//         usePound = true;
//     }

//     var num = parseInt(col, 16);

//     var r = (num >> 16) + amt;
//     if (r > 255) r = 255;
//     else if (r < 0) r = 0;

//     var b = ((num >> 8) & 0x00FF) + amt;
//     if (b > 255) b = 255;
//     else if (b < 0) b = 0;

//     var g = (num & 0x0000FF) + amt;
//     if (g > 255) g = 255;
//     else if (g < 0) g = 0;

//     return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
// }

// // return the account colors
// function getColors(req, res, next) {
//     // if the session has the account information
//     if (req.session.account) {
//         // retrieve the account customization
//         Account
//             .findById(req.session.account)
//             .populate("customization")
//             .exec(function(err, result) {
//                 if (err) {
//                     req.colors = defaultColors();
//                     next();
//                 }
//                 // if the color customization is enabled, generate and return all the needed colors
//                 else if (result && result.customization && result.customization.colors && result.customization.colors.enable) {
//                     var delta;
//                     if (result.customization.colors.contrastDefaultColor == "light") delta = 32;
//                     else delta = -32;
//                     req.colors = "var colors = {" +
//                         "'50': '" + LightenDarkenColor(result.customization.colors.color, delta * 3) + "'," +
//                         "'100': '" + LightenDarkenColor(result.customization.colors.color, delta * 2) + "'," +
//                         "'200': '" + LightenDarkenColor(result.customization.colors.color, delta) + "'," +
//                         "'300': '" + result.customization.colors.color + "'," +
//                         "'400': '" + result.customization.colors.color + "'," +
//                         "'500': '" + result.customization.colors.color + "'," +
//                         "'600': '" + result.customization.colors.color + "'," +
//                         "'700': '" + result.customization.colors.color + "'," +
//                         "'800': '" + result.customization.colors.color + "'," +
//                         "'900': '" + result.customization.colors.color + "'," +
//                         "'A100': '" + result.customization.colors.color + "'," +
//                         "'A200': '" + result.customization.colors.color + "'," +
//                         "'A400': '" + result.customization.colors.color + "'," +
//                         "'A700': '" + result.customization.colors.color + "'," +
//                         "'contrastDefaultColor': '" + result.customization.colors.contrastDefaultColor + "'" +
//                         "}";
//                     next();
//                 }
//                 // if the color customization is not enabled, return the default colors
//                 else {
//                     req.colors = defaultColors();
//                     next();
//                 }
//             });
//     } else {
//         req.colors = defaultColors();
//         next();
//     }
// }

// /*================================================================
//  ROUTES
//  ================================================================*/
// // When web browser wants to load the custom colors
// router.get("/colors/", getColors, function(req, res) {
//     res.send(req.colors);
// });
// // When web browser wants to load the default colors
// router.get("/colors/default", function(req, res) {
//     res.send(defaultColors());
// });

// module.exports = router;