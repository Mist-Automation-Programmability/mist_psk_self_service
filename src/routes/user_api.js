/*================================================================
ADMIN:
- ACS Oauth (to authenticate administrators)
- Display Admin Web page
 ================================================================*/
const express = require('express');
const router = express.Router();
const send_mail = require("../bin/send_mail");
const i18n = require("./../i18n")
const I18n = require("./../bin/models/i18n")

/*================================================================
VARS
================================================================*/

/*================================================================
 LOG IN
 ================================================================*/
router.get("/auth_url/:org_id", function(req, res) {
    if (req.session.mist && req.session.mist.auth_method) {
        res.json({ url: "/" + req.session.mist.auth_method + "/" + req.session.mist.org_id + "/login" })
    } else res.redirect("/login/" + req.params.org_id)
})

router.get("/myInfo/:org_id", (req, res) => {
    if (req.session && req.session.passport) {
        data = {
            user: {
                name: req.session.name
            },
            logout_url: "/" + req.session.mist.auth_method + "/" + req.session.mist.org_id + "/logout"
        }
        if (global.config.smtp && global.config.smtp.host) data.user.email = req.session.email
        res.json(data)
    } else res.status(401).send()
})


/*================================================================
 EMAIL
 ================================================================*/
// When user wants to receive the key one more time (same key sent by email)
router.post("/email", function(req, res) {
    // check if the user is authenticated 
    if (req.session.mist) {
        if (req.body.psk && req.body.ssid) {
            send_mail.send(req.session.email, req.session.name, req.body.ssid, req.body.psk, (err, info) => {
                if (err) {
                    console.log(err)
                    res.status(500).send()
                } else if (info) {
                    console.log(info)
                    res.send()
                } else res.send()
            })
        } else res.status(400).send()
    } else res.status(401);
});


/*================================================================
I18N
 ================================================================*/
function getText(mist, lang, page, cb) {
    var data = i18n[lang][page]
    if (mist.customization && mist.customization.i18n["_" + lang]) {
        console.log("test")
        I18n.findById(mist.customization.i18n["_" + lang])
            .exec((err, tmp) => {
                if (tmp && tmp[page]) cb({ i18n: tmp[page] })
                else cb({ i18n: data })
            })
    } else cb({ i18n: data })
}

router.get("/languages", (req, res) => {
    if (req.session.mist.customization) {
        languages = []
        if (req.session.mist.customization.i18n._en) languages.push({ short: "en", long: "English" })
        if (req.session.mist.customization.i18n._fi) languages.push({ short: "fi", long: "Finnish" })
        if (req.session.mist.customization.i18n._fr) languages.push({ short: "fr", long: "French" })
        if (req.session.mist.customization.i18n._de) languages.push({ short: "de", long: "German" })
        if (req.session.mist.customization.i18n._it) languages.push({ short: "it", long: "Italian" })
        if (req.session.mist.customization.i18n._pt) languages.push({ short: "pt", long: "Portuguese" })
        if (req.session.mist.customization.i18n._es) languages.push({ short: "es", long: "Spanish" })
        if (req.session.mist.customization.i18n._se) languages.push({ short: "se", long: "Swedish" })

        if (req.session.lang) var lang = req.session.lang
        else if (req.session.mist.customization_default) var lang = req.session.mist.customization_default
        else var lang = "en"
        res.json({ languages: languages, default: lang })
    } else {
        if (req.session.lang) var lang = req.session.lang
        else var lang = "en"
        res.json({ languages: i18n.languages, default: lang })
    }
})

router.get("/text/:org_id", (req, res) => {
    res.set('Cache-Control', 'no-store')
    if (req.query.page) {
        if (req.query.lang) {
            var lang = req.query.lang
            req.session.lang = lang
        } else var lang = "en"
        if (req.session.mist) {
            var text = getText(req.session.mist, lang, req.query.page, (text) => {
                res.json(text)
            })
        } else res.status(401).send()
    } else res.status(400).send()
})


module.exports = router;