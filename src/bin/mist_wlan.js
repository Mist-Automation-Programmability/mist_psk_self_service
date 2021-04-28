var api = require("./req");

/**
 * Allows one to query the collection of user groups given query parameters as input
 * @param {Object} mist - API credentials
 * @param {String} mist.host - Mist Cloud to request
 * @param {String} mist.api_token - Mist API Token
 * @param {String} site_id - Mist Site ID
 *  */
module.exports.getSiteWlans = function(mist, site_id, callback) {
    var path = "/api/v1/sites/" + site_id + "/wlans/derived";
    api.GET(mist, path, callback);
};

/**
 * Allows one to query the collection of user groups given query parameters as input
 * @param {Object} mist - API credentials
 * @param {String} mist.host - Mist Cloud to request
 * @param {String} mist.api_token - Mist API Token
 * @param {String} mist.org_id - Mist Org ID
 *  */
module.exports.getOrgWlans = function(mist, callback) {
    var path = "/api/v1/orgs/" + mist.org_id + "/wlans";
    api.GET(mist, path, callback);
};