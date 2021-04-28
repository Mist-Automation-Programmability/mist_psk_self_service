var api = require("./req");

/**
 * Allows one to query the collection of user groups given query parameters as input
 * @param {Object} mist - API credentials
 * @param {String} mist.host - Mist Cloud to request
 * @param {String} mist.api_token - Mist API Token
 * @param {String} mist.org_id - Mist Org ID
 *  */
module.exports.getSites = function(mist, callback) {
    var path = "/api/v1/orgs/" + mist.org_id + "/sites";
    api.GET(mist, path, callback);
};