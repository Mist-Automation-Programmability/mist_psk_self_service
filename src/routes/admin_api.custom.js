/*================================================================
ADMIN:
- ACS Oauth (to authenticate administrators)
- Display Admin Web page
 ================================================================*/
const express = require('express');
const router = express.Router();
const Account = require('../bin/models/account');
const Customization = require('../bin/models/customization');
const { populate } = require('../bin/models/i18n');
const I18n = require("../bin/models/i18n")
const default_i18n = require("./../i18n")



function save_customization(org_id, customization, cb) {
    Account.findOne({ org_id: org_id })
        .populate("_customization")
        .exec((err, account) => {
            if (err) cb({ status: 500, message: err })
            else if (account && account._customization) {
                account._customization.updateOne(customization, (err) => {
                    if (err) cb({ status: 500, message: err })
                    else cb()
                })
            } else Customization(customization).save((err, result) => {
                if (err) cb({ status: 500, message: err })
                else {
                    account._customization = result;
                    account.save((err) => {
                        if (err) cb({ status: 500, message: err })
                        else cb()
                    })
                }
            })
        })
}

function check_i18n(account_i18n, new_i18n) {
    return new Promise(resolve => {
        if (account_i18n && new_i18n) {
            I18n.findByIdAndUpdate(account_i18n, new_i18n, (err, data) => {
                if (err) console.error(err)
                resolve(data._id)
            })
        } else if (account_i18n) {
            I18n.findByIdAndRemove(account_i18n, (err) => {
                if (err) console.error(err)
                resolve()
            })
        } else if (new_i18n) {
            I18n(new_i18n).save((err, data) => {
                if (err) console.error(err)
                resolve(data._id)
            })
        } else resolve()
    })
}

async function process_i18n(customization, i18n, cb) {
    customization.i18n._en = await check_i18n(customization.i18n._en, i18n.en)
    customization.i18n._fi = await check_i18n(customization.i18n._fi, i18n.fi)
    customization.i18n._fr = await check_i18n(customization.i18n._fr, i18n.fr)
    customization.i18n._de = await check_i18n(customization.i18n._de, i18n.de)
    customization.i18n._it = await check_i18n(customization.i18n._it, i18n.it)
    customization.i18n._pt = await check_i18n(customization.i18n._pt, i18n.pt)
    customization.i18n._es = await check_i18n(customization.i18n._es, i18n.es)
    customization.i18n._se = await check_i18n(customization.i18n._se, i18n.se)
    customization.save()
    cb()
}

function save_i18n(org_id, i18n, cb) {
    Account.findOne({ org_id: org_id })
        .exec((err, account) => {
            if (err) cb({ status: 500, message: err })
            else if (account && account._customization) {
                Customization.findById(account._customization)
                    .exec((err, customization) => {
                        if (err) cb({ status: 500, message: err })
                        else if (customization) {
                            process_i18n(customization, i18n, cb)
                        } else {
                            Customization({ i18n: {} }, (err, customization) => {
                                account._customization = customization
                                account.save()
                                process_i18n(customization, i18n, cb)
                            })
                        }
                    })
            } else if (account) {
                Customization({ i18n: {} }, (err, customization) => {
                    account._customization = customization
                    account.save()
                    process_i18n(customization, i18n, cb)
                })
            } else rcb({ status: 403, message: "Account not found" })
        })
}
/*================================================================
 TOKEN ENTRYPOINT
================================================================*/

router.get("/", (req, res) => {
    if (req.session && req.session.mist && req.session.mist.org_id) {
        Account.findOne({ org_id: req.session.mist.org_id })
            .populate("_customization")
            .exec((err, account) => {
                if (err) {
                    console.error(err)
                    res.status(500).send()
                } else if (account) {
                    if (account._customization && account._customization.i18n) delete account._customization.i18n
                    res.json({
                        customization: account._customization,
                        login_preview: "https://" + global.config.appServer.vhost + "/login/preview",
                        portal_preview: "https://" + global.config.appServer.vhost + "/portal/preview"
                    })
                } else res.json()
            })

    } else res.status(401).send()
})

router.get("/i18n", (req, res) => {
    if (req.session && req.session.mist && req.session.mist.org_id) {
        Account.findOne({ org_id: req.session.mist.org_id })
            .populate({ path: "_customization", populate: { path: 'i18n._en' } })
            .populate({ path: "_customization", populate: { path: 'i18n._fi' } })
            .populate({ path: "_customization", populate: { path: 'i18n._fr' } })
            .populate({ path: "_customization", populate: { path: 'i18n._de' } })
            .populate({ path: "_customization", populate: { path: 'i18n._it' } })
            .populate({ path: "_customization", populate: { path: 'i18n._pt' } })
            .populate({ path: "_customization", populate: { path: 'i18n._es' } })
            .populate({ path: "_customization", populate: { path: 'i18n._se' } })
            .exec((err, account) => {
                if (err) {
                    console.error(err)
                    res.status(500).send()
                } else if (account && account._customization) {
                    var data = {
                        en: account._customization.i18n._en,
                        fi: account._customization.i18n._fi,
                        fr: account._customization.i18n._fr,
                        de: account._customization.i18n._de,
                        it: account._customization.i18n._it,
                        pt: account._customization.i18n._pt,
                        es: account._customization.i18n._es,
                        se: account._customization.i18n._se
                    }
                    res.json({ i18n: data, default_i18n: default_i18n })
                } else {
                    res.json({ i18n: {}, default_i18n: default_i18n })
                }
            })

    } else res.status(401).send()
})

router.post('/', (req, res) => {
    if (req.session && req.session.mist && req.session.mist.org_id) {
        if (req.body) {
            if (req.body.i18n) save_i18n(req.session.mist.org_id, req.body.i18n, (err) => {
                if (err) {
                    console.error(err)
                    res.status(err.status).send(err.message)
                } else res.status(200).send()
            })
            else save_customization(req.session.mist.org_id, req.body, (err) => {
                if (err) {
                    console.error(err)
                    res.status(err.status).send(err.message)
                } else res.status(200).send()
            })
        } else res.status(400).send("missing customization")
    } else res.status(401).send()
})




module.exports = router;