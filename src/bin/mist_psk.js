var api = require("./req");

/**
 * Get list of PSKs
 * @param {Object} mist - API credentials
 * @param {String} mist.host - Mist Cloud to request
 * @param {String} mist.api_token - Mist API Token
 * @param {String} mist.scope - orgs or sites
 * @param {String} mist.scope_id - org_id or site_id
 * @param {String} username - userName to find
 *  */
module.exports.getPsks = function(mist, username, callback) {
    if (mist.scope == "site") {
        var path = "/api/v1/sites/" + mist.site_id + "/psks";
    } else {
        var path = "/api/v1/orgs/" + mist.org_id + "/psks";
    }
    if (username) path += '?name=' + username;
    api.GET(mist, path, callback);
};
/**
 * Create a PSK
 * @param {Object} mist - API credentials
 * @param {String} mist.host - Mist Cloud to request
 * @param {String} mist.api_token - Mist API Token
 * @param {String} mist.scope - orgs or sites
 * @param {String} mist.scope_id - org_id or site_id
 * @param {object} psk - PSK data
 * @param {string} psk.name - psk name
 * @param {string} psk.passphrase - psk 
 * @param {string} psk.ssid - allowed SSID 
 * @param {number} psk.vlan_id - if specific VLAN ID 
 *  */
module.exports.createPsk = function(mist, psk, callback) {
    if (mist.scope == "site") {
        var path = "/api/v1/sites/" + mist.site_id + "/psks";
    } else {
        var path = "/api/v1/orgs/" + mist.org_id + "/psks";
    }
    api.POST(mist, path, psk, callback);
};
/**
 * Delete a PSK
 * @param {Object} mist - API credentials
 * @param {String} mist.host - Mist Cloud to request
 * @param {String} mist.api_token - Mist API Token
 * @param {String} mist.scope - orgs or sites
 * @param {String} mist.scope_id - org_id or site_id
 * @param {String} psk_id
 *  */
module.exports.deletePsk = function(mist, psk_id, callback) {
    if (mist.scope == "site") {
        var path = "/api/v1/sites/" + mist.site_id + "/psks/" + psk_id;
    } else {
        var path = "/api/v1/orgs/" + mist.org_id + "/psks/" + psk_id;
    }
    api.DELETE(mist, path, callback);
};