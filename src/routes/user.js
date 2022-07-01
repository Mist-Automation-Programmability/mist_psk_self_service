/*================================================================
LOGIN:
Generate the generic or unique login page based on the URL params
================================================================*/
var express = require('express');
var router = express.Router();
var mist_user = require("../bin/mist_user")

/*================================================================
ROUTES
================================================================*/
// when the user load the unique login page
router.get("/login/:org_id", (req, res) => {
    // determine the authenticaiton method (Azure / SAML) and generate the corresponding login link
    if (req.params.org_id) {
        if (req.params.org_id == "preview")
            res.sendFile(global.appPath + '/views/user.html');

        else
            mist_user.getAccount(req.params.org_id, (err, mist) => {
                if (err) {
                    // for some reason, when there is an issue with the DB encyption, the cb is called twice, which crashing the server
                    // using this test to avoid a lamentable server crash...
                    if (!res.headersSent) {
                        if (err.code == 404)
                            res.redirect("/unknown");
                        else
                            res.redirect("/error");
                    }
                } else if (mist) {
                    req.session.mist = mist;
                    res.sendFile(global.appPath + '/views/user.html');
                } else
                    res.redirect("/unknown");
            });
    } else
        res.redirect("/unknown");
});

router.get("/portal/:org_id", (_req, res) => {
    res.sendFile(global.appPath + "/views/user.html")
})
router.get("/unknown", (_req, res) => {
    res.sendFile(global.appPath + "/views/user.html")
})
router.get("/error", (_req, res) => {
    res.sendFile(global.appPath + "/views/user.html")
})

// just to be sure. Should never be called...
router.get("/login/:org_id/callback", function(req, res) {
    var error_description = "It seems the callback URL is misconfigured on your AzureAD or SAML. Please contact your administrator."
    res.redirect('/login/' + req.session.mist.org_id + "?error=" + error_description);
});

// When the logout URL is called
router.get("/logout/", function(req, res) {
    var loginurl = require('querystring').escape("https://" + serverHostname + "/login/" + req.session.account._id + "/");
    // if the account is configured with AzureAD, redirect the user to azure logout URL
    if (req.session.account.azure) {
        res.redirect("https://login.windows.net/" + req.session.account.azure.tenant + "/oauth2/logout?post_logout_redirect_uri=" + loginurl);
    } else if (req.session.account.adfs) {
        res.redirect(req.session.account.adfs.logoutUrl + "?wa=wsignout1.0&wreply=" + loginurl);
    } else res.redirect("/");
    req.logout();
    req.session.destroy();
});

module.exports = router;