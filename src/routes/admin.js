/*================================================================
LOGIN:
Generate the generic or unique login page based on the URL params
================================================================*/
var express = require('express');
var router = express.Router();

/*================================================================
ROUTES
================================================================*/
// when the user load the unique login page
router.get("/", (req, res) => {
    res.sendFile(global.appPath + '/views/admin.html');
});
router.get("/login", (req, res) => {
    res.sendFile(global.appPath + '/views/admin.html');
});
router.get("/org", (req, res) => {
    res.sendFile(global.appPath + '/views/admin.html');
});
router.get("/config", (req, res) => {
    res.sendFile(global.appPath + '/views/admin.html');
});

// when user wants to see the help page
router.get('/help/:method', function(req, res, next) {

    if (req.params.method == "azure")
        res.render('help_azure', {
            title: 'Get-a-Key Help'
        });
    else if (req.params.method == "adfs")
        res.render('help_adfs', {
            title: 'Get-a-Key Help'
        });
    else if (req.params.method == "okta")
        res.render('help_okta', {
            title: 'Get-a-Key Help'
        });
    else {
        const message = "The requested url " + req.originalUrl + " was not found on this server.";
        res.status(404);
        res.render('error', {
            status: 404,
            message: message,
            stack: {}
        });
    }
});
module.exports = router;