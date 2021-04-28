/*================================================================
Okta:
deals with Okta authentication for users
the req param "account_id" in the URL is used to identify the app account (so the Okta configuration)
================================================================*/
var express = require('express');
var router = express.Router();
var OktaStrategy = require('passport-okta-oauth').Strategy;
var vhost = require("../config").appServer.vhost;
const Account = require("../bin/models/account");

function getOktaAccount(req, res, next) {
    if (req.session.org_id) var org_id = req.session.org_id
    else {
        var org_id = req.params.org_id;
        req.session.org_id = org_id;
    }
    if (req.query) {
        if (req.query.error_description) return res.redirect('/login/' + req.params.org_id + "?error=" + req.query.error_description);
    }
    Account
        .findOne({ org_id: org_id })
        .populate("_okta")
        .exec((err, account) => {
            if (err) res.status(500).json({ error: err });
            else if (account) {
                const options = {
                    audience: "https://" + account._okta.audience,
                    clientID: account._okta.client_id,
                    clientSecret: account._okta.client_secret,
                    scope: ['openid', 'email', 'profile'],
                    response_type: 'code',
                    callbackURL: "https://" + vhost + "/okta/callback"
                }
                passport.use(new OktaStrategy(options, function(accessToken, refreshToken, profile, cb) {
                    return cb(null, profile)
                }));
                next();
            } else res.render('error', {
                status: 404,
                message: "Page not found",
                stack: {}
            });
        })
}

/*================================================================
 USER AZURE OAUTH
 ================================================================*/
/* GET login page. Passport will redirect to Azure authentication page */
router.get('/:org_id/login', getOktaAccount,
    passport.authenticate('okta')
);

/* GET callback page. Azure is sending the Authorizaton Code. Passport will deal with that */
router.get('/callback', getOktaAccount,
    passport.authenticate('okta', { failureRedirect: '/login' }),
    (req, res) => {
        if (req.user.email) req.session.email = req.user.email;
        else req.session.email = "unknown";
        if (req.user.name) req.session.name = req.user.displayName;
        else req.session.name = ""
        console.info("\x1b[32minfo\x1b[0m:", 'User ' + req.session.email + ' logged in');
        res.redirect('/portal/' + req.session.org_id);
    }
);

/* Handle Logout */
router.get('/:org_id/logout', function(req, res) {
    console.log("\x1b[32minfo\x1b[0m:", "User " + req.session.email + " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/' + req.params.org_id);
});

module.exports = router;