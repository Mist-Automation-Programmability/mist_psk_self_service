/*================================================================
ADMIN:
- ACS Oauth (to authenticate administrators)
- Display Admin Web page
 ================================================================*/
var express = require('express');
var router = express.Router();
var Account = require('../bin/models/account');
var Token = require('../bin/models/token');
var mist_token = require("../bin/mist_token");


/*================================================================
 TOKEN FUNCTIONS
================================================================*/
function createAccountAndToken(new_account, new_token, cb) {
    Account(new_account).save((err, saved_account) => {
        if (err) {
            console.log(err)
            cb(500, err)
        } else createToken(saved_account, new_token, cb)
    })
}

function createToken(account, new_token, cb) {
    Token(new_token).save((err, saved_token) => {
        if (err) {
            console.log(err)
            cb(500, err)
        } else {
            account._token = saved_token;
            account.save((err) => {
                if (err) {
                    console.log(err)
                    cb(500, err)
                } else cb(200, { created_by: new_token.created_by, auto_mode: new_token.apitoken_id != "manual_token" })
            })
        }
    })
}

function updateToken(account, new_token, cb) {
    result = { status: 200, data: null }
    Token.findOne({ _id: account._token }, (err, data) => {
        for (const [key, value] of Object.entries(psk_data)) {
            if (!key.startsWith("_")) {
                data[key] = psk_data[key]
            }
        }
        data.save((err, save_token) => {
            if (err) {
                console.log(err)
                cb(500, err)
            } else cb(200, { created_by: new_token.created_by, auto_mode: new_token.apitoken_id != "manual_token" })
        })
    })
}

function saveNewToken(req, res, err, data) {
    // if not able to generate the token
    if (err) {
        res.status(err.code).send(err.error)
            // if the token has been generated
    } else {
        new_token = {
                apitoken: data.key,
                apitoken_id: data.id,
                scope: req.body.scope,
                created_by: req.session.self.email
            }
            //try to find the account in the DB
        Account.findOne({
                host: req.session.mist.host,
                org_id: req.session.mist.org_id
            })
            .populate("_token")
            .exec((err, account) => {
                if (err) {
                    console.log(err)
                    res.status(500).send(err)
                        // if the account already exists, create or update the token
                } else if (account) {
                    // if the account already has a token, update it
                    if (account._token) updateToken(account, new_token, (status, data) => res.status(status).json(data))
                        // otherwise, create the token entry in the DB for the account
                    else createToken(account, new_token, (status, data) => res.status(status).json(data))
                        // if the account does not exists, create the account and the token                    
                } else {
                    new_account = {
                        host: req.session.mist.host,
                        org_id: req.session.mist.org_id,
                    }
                    createAccountAndToken(new_account, new_token, (status, data) => { res.status(status).json(data) })
                }
            })
    }
}

/*================================================================
 TOKEN ENTRYPOINT
================================================================*/

router.get('/', (req, res) => {
    if (req.session && req.session.mist && req.session.mist.org_id) {
        data = {
            configured: false,
            created_by: null,
            scope: null,
            auto_mode: true,
            can_delete: false
        }
        Account.findOne({ org_id: req.session.mist.org_id, host: req.session.mist.host })
            .populate("_token")
            .exec((err, account) => {
                if (err) {
                    console.log(err)
                    res.status(500).send(err)
                } else if (account && account._token) {
                    data.token.configured = true
                    data.token.created_by = account._token.created_by
                    data.token.scope = account._token.scope
                    if (account._token.apitoken_id == "manual_token") {
                        data.token.auto_mode = false
                    }
                    if (account._token.scope == "user" && account._token.created_by == req.session.self.email) {
                        data.token.can_delete = true
                    } else if (account._token.scope == "org" && req.session.mist.privilege == "admin") {
                        data.token.can_delete = true
                    }
                    res.json(data)
                } else res.send(data)
            })
    } else res.status(401).send()
})

router.post("/", (req, res) => {
    if (req.session && req.session.mist) {
        if (req.body.scope) {
            if (req.body.scope == "user") {
                mist_token.generate(req.session.mist, "user", (err, data) => saveNewToken(req, res, err, data))
            } else if (req.body.scope == "org") {
                mist_token.generate(req.session.mist, "org", (err, data) => saveNewToken(req, res, err, data))
            }
        } else if (req.body.apitoken) {
            new_token = {
                id: 'manual_token',
                key: req.body.apitoken,
            }
            saveNewToken(req, res, new_token)
        } else res.status(400).send("missing scope")
    } else res.status(401).send()
})

router.delete("/", (req, res) => {
    if (req.session && req.session.mist) {
        Account.findOne({ host: req.session.mist.host, org_id: req.session.mist.org_id })
            .populate("_token")
            .exec((err, db_account) => {
                if (db_account && db_account._token) {
                    db_token = db_account._token
                    mist_token.delete(req.session.mist, db_token, (err, data) => {
                        if (err) {
                            console.log(err)
                            res.status(err.code).send(err.error)
                        } else {
                            Token.findByIdAndRemove(db_token._id, (err) => {
                                Account.findOneAndUpdate({ _id: db_account._id },   { $unset: { _token: 1 } }).exec()
                                res.json(null)
                            })
                        }
                    })
                } else {
                    res.status(400).send("Account of Token not found")
                }
            })
    } else res.status(401).send()

})


module.exports = router;