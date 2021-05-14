var Account = require("../bin/models/account");



/*================================================================
FUNCTION
================================================================*/
module.exports.getAccount = function(org_id, cb) {
    // retrieve the account in the DB based on the req params 
    Account
        .findOne({ org_id: org_id })
        .populate("_psk")
        .populate("_token")
        .populate("_azure")
        .populate("_saml")
        .populate("_customization")
        .exec((err, account) => {
            if (err) return cb({ code: 500, error: err })
            else if (account) {
                failure = false;
                // store the usefull data in the user session
                mist = {
                    host: account.host,
                    org_id: account.org_id
                }
                if (account._psk) {
                    mist.site_id = account._psk.site_id
                    mist.scope = account._psk.scope
                    mist.ssid = account._psk.ssid
                    mist.psk = {
                        vlan_id: account._psk.vlan_id,
                        min: account._psk.min,
                        cap: account._psk.cap,
                        num: account._psk.num,
                        spec: account._psk.spe,
                        length: account._psk.length
                    }
                } else {
                    failure = true;
                    return cb({ code: 400, error: "Account not configured" });
                }
                if (account._token) {
                    mist.token = account._token.apitoken
                } else {
                    failure = true;
                    return cb({ code: 400, error: "Account API Token not configured" });
                }
                if (account.auth_method && (
                        account.auth_method == "saml" && account["_" + account.auth_method] ||
                        account.auth_method == "azure" && account["_" + account.auth_method] ||
                        account.auth_method == "google" ||
                        account.auth_method == "okta" ||
                        account.auth_method == "openid"
                    )) {
                    mist.auth_method = account.auth_method
                } else {
                    failure = true;
                    return cb({ code: 400, error: "Account Auth Method not configured" });
                }
                if (account._customization) {
                    mist.customization = account._customization;
                }
                // update the user session
                if (!failure) cb(null, mist)
            } else
                cb({ code: 404, error: "Page Not Found" })
        });
}