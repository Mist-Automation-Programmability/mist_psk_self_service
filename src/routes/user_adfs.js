var express = require('express');
var router = express.Router();

var Account = require("../bin/models/account");
var SamlStrategy = require('passport-saml').Strategy;
var fs = require('fs');
var mist_user = require("../bin/mist_user")

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

function getAccount(req, res, next) {
    Account
        .findOne({ org_id: req.params.org_id })
        .populate("_adfs")
        .exec(function(err, account) {
            if (err) res.status(500).json({ error: err });
            else if (account) {
                passport.use(new SamlStrategy({
                        entryPoint: account._adfs.entry_point,
                        issuer: req.params.org_id,
                        callbackUrl: 'https://' + global.config.appServer.vhost + '/adfs/' + req.params.org_id + '/postResponse',
                        privateKey: fs.readFileSync(global.appPath + "/certs/" + req.params.org_id + '.key', 'utf-8'),
                        cert: account._adfs.certs,
                        // other authn contexts are available e.g. windows single sign-on
                        authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password',
                        // not sure if this is necessary?
                        acceptedClockSkewMs: -1,
                        identifierFormat: null,
                        // this is configured under the Advanced tab in AD FS relying party
                        signatureAlgorithm: 'sha256',
                        //forceAuthn: true,
                        additionalParams: {}
                    },
                    function(profile, done) {
                        return done(null, {
                            email: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                            upn: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'],
                            name: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname']
                                // e.g. if you added a Group claim
                                // group: profile['http://schemas.xmlsoap.org/claims/Group']
                        });
                    }
                ));
                next();
            } else res.redirect("/unknown")
        });
}

/* GET login page. */

router.get('/:org_id/login', getAccount,
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true })
);

/* Handle Login POST */
router.post('/:org_id/postResponse', getAccount,
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    (req, res) => {
        if (req.user.email) req.session.email = req.user.email;
        else if (req.user.upn) req.session.email = req.user.upn;
        else req.session.email = "unknown";
        if (req.user.name) req.session.name = req.user.name;
        else req.session.name = ""
        console.info("\x1b[32minfo\x1b[0m:", 'User ' + req.session.email + ' logged in');

        if (req.session.mist) res.redirect('/portal/' + req.session.mist.org_id);
        else mist_user.getAccount(req.params.org_id, (err, mist) => {
            if (err) res.redirect("/error")
            else {
                req.session.mist = mist
                res.redirect('/portal/' + req.session.mist.org_id);
            }
        })
    }
);

/* Handle Logout */
router.get('/:org_id/logout', function(req, res) {
    if (req.session.user) console.log("User " + req.session.passport.user.upn + " is now logged out.");
    else console.log('user logged out.');
    req.logout();
    req.session.destroy();
    res.redirect('/login/' + req.params.org_id);
});

module.exports = router;