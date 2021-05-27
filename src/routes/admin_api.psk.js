/*================================================================
ADMIN:
- ACS Oauth (to authenticate administrators)
- Display Admin Web page
 ================================================================*/
var express = require('express');
var router = express.Router();
const Account = require('../bin/models/account');
const Psk = require("../bin/models/psk");
var mist_site = require("../bin/mist_site");
var mist_wlan = require("../bin/mist_wlan");


/*================================================================
 FUNCTIONS
 ================================================================*/
function parseWlans(wlans) {
    data = []
    for (var i in wlans) {
        if (wlans[i].auth && wlans[i].auth.type == "psk") {
            data.push(wlans[i].ssid)
        }
    }
    return data
}

function createConfig(account_id, psk_data, cb) {
    Psk(psk_data).save((err, saved_psk) => {
        if (err) {
            console.log(err)
            cb(500, err)
        } else {
            updateAccount(account_id, saved_psk._id, cb)
        }
    })
}

function updateConfig(account_id, psk_id, psk_data, cb) {
    Psk.findOne({ _id: psk_id }, (err, data) => {
        for (const [key, value] of Object.entries(psk_data)) {
            if (!key.startsWith("_")) {
                console.log(key, value)
                data[key] = psk_data[key]
            }
        }
        data.save((err, psk) => {
            if (err) {
                console.log(err)
                cb(500, err)
            } else if (psk) cb(200)
            else createConfig(account_id, psk_data, cb)

        })
    })
}

function updateAccount(account_id, psk_id, cb) {
    Account.findByIdAndUpdate(account_id, { _psk: psk_id }, (err) => {
        if (err) {
            console.log(err)
            cb(500, err)
        } else cb(200)
    })
}

/*================================================================
 ROUTES
 ================================================================*/
router.get("/sites", (req, res) => {
    if (req.session && req.session.mist) {
        mist_site.getSites(req.session.mist, (err, sites) => {
            if (err) res.status(err.code).send(err.error)
            else res.json(sites)
        })
    } else res.status(401).send()
})

router.get("/wlans", (req, res) => {
    if (req.session && req.session.mist) {
        if (req.query.site_id) {
            site_id = req.query.site_id
            mist_wlan.getSiteWlans(req.session.mist, req.query.site_id, (err, wlans) => {
                if (err) res.status(err.code).send(err.error)
                else {
                    data = parseWlans(wlans)
                    res.json(data)
                }
            })
        } else {
            mist_wlan.getOrgWlans(req.session.mist, (err, wlans) => {
                if (err) res.status(err.code).send(err.error)
                else {
                    data = parseWlans(wlans)
                    res.json(data)
                }
            })
        }
    } else res.status(401).send()
})

router.get('/', (req, res) => {
    if (req.session && req.session.mist && req.session.mist.org_id) {
        data = {
            configured: false,
            scope: "site",
            site_id: null,
            ssid: null,
            vlan_id: 0
        }
        Account.findOne({ org_id: req.session.mist.org_id, host: req.session.mist.host })
            .populate("_psk")
            .exec((err, account) => {
                if (err) {
                    console.log(err)
                    res.status(500).send(err)
                } else if (account && account._psk) {
                    data.psk = account._psk
                    data.psk.configured = true
                    if (account._psk.site_id) data.psk.site_id = account._psk.site_id
                    res.json(data)
                } else res.send(data)
            })
    } else res.status(401).send()
})

router.post("/", (req, res) => {
    if (req.session && req.session.mist) {
        if (req.body) {
            Account.findOne({ org_id: req.session.mist.org_id, host: req.session.mist.host })
                .exec((err, account) => {
                    if (err) {
                        console.log(err)
                        res.status(500).send(err)
                    } else if (account && account._psk) {
                        updateConfig(account._id, account._psk, req.body, (status, mess) => res.status(status).send(mess))
                    } else {
                        createConfig(account._id, req.body, (status, mess) => res.status(status).send(mess))
                    }
                })
        } else res.status(400).send()
    } else res.status(401).send()
})


module.exports = router;