/*================================================================
ADMIN:
- ACS Oauth (to authenticate administrators)
- Display Admin Web page
 ================================================================*/
var express = require('express');
var router = express.Router();
var Account = require('../bin/models/account');

var mist_login = require("../bin/mist_login");


/*================================================================
 LOG IN
 ================================================================*/

router.post("/login", (req, res) => {
    if (req.body.host) var mist = { host: req.body["host"] }
    else return res.send({ "error": "missing host" })
    if (req.body.host) var username = req.body["username"] 
    else return res.send({ "error": "missing host" })
    if (req.body.host) var password = req.body["password"] 
    else return res.send({ "error": "missing host" })
    var two_factor_code = req.body["two_factor_code"] 

    req.session.mist = { host: mist.host }
    req.session.username = username
    mist_login.login(mist, username, password, two_factor_code, (err, data) => {
        // deepcode ignore ServerLeak: returning error code from Mist
        if (err) res.status(err.code).send(err.error)
        else if (data.self.two_factor_required && !data.self.two_factor_passed) res.json({ "result": "two_factor_required" })
        else {
            req.session.self = data.self
            req.session.mist = data.mist
            res.json({ "result": "success" })
        }
    })
});

/*================================================================
 ORGS
 ================================================================*/

function compare(a, b) {
    // Use toUpperCase() to ignore character casing
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    let comparison = 0;
    if (nameA > nameB) {
        comparison = 1;
    } else if (nameA < nameB) {
        comparison = -1;
    }
    return comparison;
}
router.get("/orgs", (req, res) => {
    var orgs = []
    var org_ids = []
    if (req.session && req.session.self) {
        for (var i in req.session.self.privileges) {
            var entry = req.session.self.privileges[i]
            var tmp = null
            if (entry.role == "write" || entry.role == "admin") {
                if (entry.scope == "org") {
                    tmp = { "name": entry.name, "org_id": entry.org_id }
                } else if (entry.scope == "site") {
                    tmp = { "name": entry.org_name, "org_id": entry.org_id }
                }
                if (tmp && org_ids.indexOf(tmp.org_id) < 0) {
                    org_ids.push(tmp.org_id)
                    orgs.push(tmp)
                }
            }
        }
        orgs.sort(compare)
        res.json(orgs)
    } else res.status(401).send()
})

router.post("/orgs", (req, res) => {
    var org_id = req.body.org_id;
    if (req.session && req.session.self) {
        for (var i in req.session.self.privileges) {
            var entry = req.session.self.privileges[i]
            if (entry.role == "write" || entry.role == "admin") {
                if (entry.org_id == org_id) {
                    req.session.mist.org_id = org_id;
                    req.session.mist.privilege = entry.role
                    return res.send()
                }
            }
        }
        res.status(400).json({ error: "org_id " + org_id + " not found" })
    } else res.status(401).send()
})


/*================================================================
 CONFIG 
 ================================================================*/
router.get('/config', (req, res) => {
    if (req.session && req.session.mist && req.session.mist.org_id && req.session.self) {
        data = {
            privilege: req.session.mist.privilege,
            account_created: false,
            token: {
                configured: false,
                created_by: null,
                scope: null,
                auto_mode: true,
                can_delete: false
            },
            psk: {
                configured: false,
                config: {
                    scope: "site",
                    site_id: null,
                    ssid: null,
                    min: true,
                    cap: false,
                    num: false,
                    spec: false,
                    length: 12,
                    vlan_id: 0
                }
            },
            auth: {
                configured: false,
                method: null,
                host: "",
                org_id: ""
            },
            portal_url: ""
        }
        Account.findOne({ org_id: req.session.mist.org_id, host: req.session.mist.host })
            .populate("_token")
            .populate("_psk")
            .exec((err, account) => {
                if (err) {
                    console.error(err)
                    res.status(500).send("Unable to get account")
                } else if (account) {
                    req.session.account_id = account._id
                    data.account_created = true
                    data.portal_url = "https://" + global.config.appServer.vhost + "/login/" + account.org_id + "/"
                    if (account.scope) data.scope = account.scope
                        //token
                    if (account._token) {
                        data.token.configured = true
                        data.token.created_by = account._token.created_by
                        data.token.scope = account._token.scope
                        if (account._token.apitoken_id == "manual_token") {
                            data.token.auto_mode = false
                        }
                        if ((account._token.scope == "user" && account._token.created_by == req.session.self.email) ||
                            (account._token.scope == "org" && req.session.mist.privilege == "admin")) {
                            data.token.can_delete = true
                        }
                    }
                    // psk
                    if (account._psk) {
                        data.psk.configured = true
                        data.psk.config = account._psk
                        delete data.psk.config._id
                        delete data.psk.config.__v
                        if (account._psk.site_id) data.psk.config.site_id = account._psk.site_id
                    }
                    // auth
                    if (account.auth_method) {
                        data.auth.method = account.auth_method
                        data.auth.host = global.config.appServer.vhost
                        data.auth.org_id = req.session.mist.org_id
                        if (account["_" + account.auth_method]) {
                            data.auth.configured = true
                        }
                    }
                    res.json(data)
                } else res.send(data)
            })
    } else res.status(401).send()
})


router.get("/portal_url", (req, res) => {
    if (req.session && req.session.mist.org_id) {
        res.json({ "portal_url": "https://" + global.config.appServer.vhost + "/login/" + req.session.mist.org_id + "/" })
    } else res.status(401).send()
})


/*================================================================
 DISCLAIMER
 ================================================================*/
router.get('/disclaimer', (req, res) => {
    let data = {}
    if (global.config.login.disclaimer) data["disclaimer"] = global.config.login.disclaimer;
    if (global.config.login.github_url) data["github_url"] = global.config.login.github_url;
    if (global.config.login.docker_url) data["docker_url"] = global.config.login.docker_url;
    res.json(data);
})

router.get('/hosts', (req, res) => {
    let data = []
    for (var key in global.config.mist_hosts) {
        data.push({ "value": global.config.mist_hosts[key], "viewValue": key })
    }
    data = data.sort((a, b) => {
        if (a.viewValue.toLowerCase() < b.viewValue.toLowerCase()) return -1;
        else if (a.viewValue.toLowerCase() > b.viewValue.toLowerCase()) return 1;
        else return 0
    })
    res.json(data);
})

module.exports = router;