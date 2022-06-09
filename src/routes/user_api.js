/*================================================================
ADMIN:
- ACS Oauth (to authenticate administrators)
- Display Admin Web page
 ================================================================*/
const express = require('express');
const router = express.Router();
const send_mail = require("../bin/send_mail");
const i18n = require("./../i18n")
const I18n = require("./../bin/models/i18n");
const { languages } = require('./../i18n');
const Account = require('../bin/models/account');

/*================================================================
VARS
================================================================*/

/*================================================================
 LOG IN
 ================================================================*/
router.get("/auth_url/:org_id", function(req, res) {
    // preview mode
    if (req.params.org_id == "preview") {
        res.json({ url: "/" })
            // user mode
    } else if (req.session.mist && req.session.mist.auth_method) {
        res.json({ url: "/" + req.session.mist.auth_method + "/" + req.session.mist.org_id + "/login" })
    } else res.redirect("/login/" + req.params.org_id)
})

router.get("/myInfo/:org_id", (req, res) => {
    // preview mode
    if (req.params.org_id == "preview") {
        data = {
            user: {
                name: "<username>",
                email: "user@email"
            },
            logout_url: "/"
        }
        res.json(data)
            // user mode
    } else if (req.session && req.session.passport) {
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
    if (!req.session.mist) res.status(401).send("Unknown session")
        // preview mode
    else if (!req.session.passport) res.send()
        // authenticated user mode
        // retrieve the account details (to have the account_id)
    else if (req.body.psk && req.body.ssid) {
        send_mail.send(req.session.email, req.session.name, req.body.ssid, req.body.psk, (err, info) => {
            if (err) {
                console.error(err)
                res.status(500).send()
            } else if (info) {
                res.send()
            } else res.send()
        })
    } else res.status(400).send()
});


/*================================================================
I18N LANGUAGES
 ================================================================*/
function sendLanguage(custom_i18n, req, res) {
    var languages = []
    var lang = "en"
        // retrieve custom languages, with short/long values
    if (custom_i18n) {
        i18n.languages.forEach(entry => {
                if ("_" + entry["short"] in custom_i18n) languages.push(entry)
            })
            // retrieve default language
        if (req.session.lang) var lang = req.session.lang
        else if (req.session.mist.customization_default) var lang = req.session.mist.customization_default
            // use default languages
    } else {
        i18n.languages.forEach(entry => {
            if (entry["short"] in i18n) languages.push(entry)
        })

        if (req.session.lang) var lang = req.session.lang
    }
    res.set('Cache-Control', 'no-store')
    res.json({ languages: languages, default: lang })

}

function getLanguages(req, res) {
    if (req.session.mist && req.session.mist.customization && req.session.mist.customization.i18n) sendLanguage(req.session.mist.customization.i18n, req, res)
    else sendLanguage(null, req, res)
}

function getLanguagesPreview(req, res) {
    Account.findOne({ org_id: req.session.mist.org_id })
        .populate("_customization")
        .exec((err, account) => {
            if (account && account._customization && account._customization.i18n) sendLanguage(account._customization.i18n.toJSON(), req, res)
            else sendLanguage(null, req, res)
        })

}

router.get("/languages", (req, res) => {
    // preview because mist self
    if (req.session.self) getLanguagesPreview(req, res)
        // user access
    else if (req.session) getLanguages(req, res)
    else res.status(400).send("Not Authorized")
})

/*================================================================
I18N TEXT
 ================================================================*/

function getText(mist, lang, page, cb) {
    var data = i18n[lang][page]
    if (mist.customization && mist.customization.i18n && mist.customization.i18n["_" + lang]) {
        I18n.findById(mist.customization.i18n["_" + lang])
            .exec((err, tmp) => {
                if (tmp && tmp[page]) cb({ i18n: tmp[page] })
                else cb({ i18n: data })
            })
    } else cb({ i18n: data })
}

function getTextPreview(mist, lang, page, cb) {
    var data = i18n[lang][page]
    Account.findOne({ org_id: mist.org_id })
        .populate("_customization")
        .exec((err, account) => {
            if (account) {
                I18n.findById(account._customization.i18n["_" + lang])
                    .exec((err, tmp) => {
                        if (tmp && tmp[page]) cb({ i18n: tmp[page] })
                        else cb({ i18n: data })
                    })
            } else cb({ i18n: data })
        })
}

router.get("/text/:org_id", (req, res) => {
    if (!req.query.page) res.status(400).send("Missing parameters")
    if (!req.session.mist) res.status(401).send("Not Authorized")
    else {
        if (req.query.lang) {
            var lang = req.query.lang
            req.session.lang = lang
        } else var lang = "en"

        if (req.params.org_id == "preview") {
            getTextPreview(req.session.mist, lang, req.query.page, (text) => {
                res.set('Cache-Control', 'no-store')
                res.json(text)
            })
        } else {
            getText(req.session.mist, lang, req.query.page, (text) => {
                res.set('Cache-Control', 'no-store')
                res.json(text)
            })
        }
    }
})


module.exports = router;