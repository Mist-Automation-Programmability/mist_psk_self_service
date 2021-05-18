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
router.get("/login/:org_id", function(req, res) {
    // determine the authenticaiton method (Azure / SAML) and generate the corresponding login link
    if (req.params.org_id) {
        mist_user.getAccount(req.params.org_id, (err, mist) => {
            if (err) {
                // for some reason, when there is an issue with the DB encyption, the cb is called twice, which crashing the server
                // using this test to avoid a lamentable server crash...
                if (!res.headersSent) {
                    if (err.code == 404) res.redirect("/unknown")
                    else res.redirect("/error")
                }
            } else if (mist) {
                req.session.mist = mist
                res.sendFile(global.appPath + '/views/user.html');
            } else res.redirect("/unknown")
        })
    } else res.redirect("/unknown")
});

router.get("/portal/:org_id", (req, res) => {
    res.sendFile(global.appPath + "/views/user.html")
})
router.get("/unknown", (req, res) => {
    res.sendFile(global.appPath + "/views/user.html")
})
router.get("/error", (req, res) => {
    res.sendFile(global.appPath + "/views/user.html")
})

// just to be sure. Should never be called...
router.get("/login/:org_id/callback", function(req, res) {
    res.render('error', { error: { message: "It seems the callback URL is misconfigured on your AzureAD or SAML. Please be sure to use the callback url from the configuration interface." } });
});

// // When the generic login page is called
// router.get("/login", function(req, res) {
//     res.render("login", {
//         title: 'Get a Key!',
//         authUrl: "/admin_access",
//         method: null
//     });
// });
// When the logout URL is called
router.get("/logout/", function(req, res) {
    var loginurl = require('querystring').escape("https://" + serverHostname + "/login/" + req.session.account._id + "/");
    // if the account is configured with AzureAD, redirect the user to azure logout URL
    if (req.session.account.azure) {
        res.redirect("https://login.windows.net/" + req.session.account.azure.tenant + "/oauth2/logout?post_logout_redirect_uri=" + loginurl);
    } else if (req.session.account.saml) {
        res.redirect(req.session.account.saml.logoutUrl + "?wa=wsignout1.0&wreply=" + loginurl);
    } else res.redirect("/");
    req.logout();
    req.session.destroy();
});

module.exports = router;