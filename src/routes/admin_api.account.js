/*================================================================
ADMIN:
- ACS Oauth (to authenticate administrators)
- Display Admin Web page
 ================================================================*/
const express = require('express');
const router = express.Router();
const Account = require('../bin/models/account');
const Adfs = require('../bin/models/adfs');
const Azure = require('../bin/models/azure');
const Customization = require('../bin/models/customization');
const Google = require('../bin/models/google');
const I18n = require("../bin/models/i18n")
const Okta = require('../bin/models/okta');
const Psk = require('../bin/models/psk');
const Token = require('../bin/models/token');

function delete_account(doc_id, cb) {
    Account.findByIdAndRemove(doc_id, (err) => { cb(err) })
}

function delete_adfs(doc_id) {
    Adfs.findByIdAndRemove(doc_id, (err) => { console.err(err) })
}

function delete_azure(doc_id) {
    Azure.findByIdAndRemove(doc_id, (err) => { console.err(err) })
}

function delete_customization(doc_id) {
    Customization.findById(doc_id)
        .exec((err, data) => {
            if (data) {
                for (const [key, value] of Object.entries(data)) {
                    delete_i18n(value)
                }
            }
            Customization.findByIdAndRemove(doc_id, (err) => { console.err(err) })
        })
}

function delete_google(doc_id) {
    Google.findByIdAndRemove(doc_id, (err) => { console.err(err) })
}

function delete_i18n(doc_id) {
    I18n.findByIdAndRemove(doc_id, (err) => { console.err(err) })
}

function delete_okta(doc_id) {
    Okta.findByIdAndRemove(doc_id, (err) => { console.err(err) })
}

function delete_psk(doc_id) {
    Psk.findByIdAndRemove(doc_id, (err) => { console.err(err) })
}

function delete_token(doc_id) {
    Token.findByIdAndRemove(doc_id, (err) => { console.err(err) })
}


function process_delete(org_id, cb) {
    Account.findOne({ org_id: org_id })
        .exec((err, account) => {
            if (err) cb({ status: 500, message: err })
            else if (account) {
                if (account._adfs) delete_adfs(account._adfs)
                if (account._azure) delete_azure(account._azure)
                if (account._customization) delete_customization(account._customization)
                if (account._google) delete_google(account._google)
                if (account._okta) delete_okta(account._okta)
                if (account._psk) delete_psk(account._psk)
                if (account._token) delete_token(account._token)
                delete_account(account._id, (err) => {
                    if (err) {
                        console.err(err)
                        cb({ status: 500, message: err })
                    } else cb()
                })
            } else cb({ status: 403, message: "Account not found" })
        })
}
/*================================================================
 TOKEN ENTRYPOINT
================================================================*/

router.delete('/', (req, res) => {
    if (req.session && req.session.mist && req.session.mist.org_id) {
        process_delete(req.session.mist.org_id, (err) => {
            if (err) res.status(err.status).send(err.message)
            else res.send()
        })
    } else res.status(401).send()
})




module.exports = router;