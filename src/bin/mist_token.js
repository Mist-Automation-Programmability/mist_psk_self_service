var api = require("./req");
var self = require("./mist_self")
    /**
     * Create Mist API Token
     * @param {Object} mist - API credentials
     * @param {String} mist.host - Mist Cloud to request
     * @param {String} mist.mode - user or org, depending on the type of token
     * @param {String} callback - 
     *  */
module.exports.generate = function(mist, scope, callback) {
    var path = "";
    var data = {}
    if (scope == "org") {
        path = "/api/v1/orgs/" + mist.org_id + "/apitokens"
        data = {
            "name": "mist_psk_portal_token",
            "privileges": [
                { "scope": "org", "role": "write" }
            ]
        }
    } else if (scope == "user") {
        path = "/api/v1/self/apitokens"
        data = {
            "name": "mist_psk_portal_token"
        }
    }
    if (path) {
        api.POST(mist, path, data, (err, data) => {
            if (err) {
                console.log(err)
                callback(err)
            } else {
                callback(null, data)
            }
        });
    } else {
        callback({ code: 500, error: "scope is missing" })
    }
};

/**
 * Delete Mist API Token
 * @param {Object} mist - API credentials
 * @param {String} mist.host - Mist Cloud to request
 * @param {String} mist.mode - user or org, depending on the type of token
 * @param {String} token_id - token id to delete
 * @param {String} callback - 
 *  */
module.exports.delete = function(mist, token, callback) {
    var path = "";
    var data = {}
    if (token.scope == "org") {
        path = "/api/v1/orgs/" + mist.org_id + "/apitokens/" + token.apitoken_id
    } else if (token.scope == "user") {
        path = "/api/v1/self/apitokens/" + token.apitoken_id
    }
    if (path) {
        api.DELETE(mist, path, (err, data) => {
            if (err) {
                console.log(err)
                callback(err)
            } else {
                callback(null, data)
            }
        });
    } else {
        callback({ code: 500, error: "scope is missing" })
    }
};