/*================================================================
API:
Deal with all the web browser API call:
- users (to create/delete/... keys)
- admins (to retrieve/save the app parameters)
 ================================================================*/
var express = require('express');
var router = express.Router();
var Account = require("../bin/models/account");
var Customization = require("../bin/models/customization");

/*================================================================
 FUNCTIONS
 ================================================================*/
// generate the username (to fit ACS limitations)
function generateUsername(req) {
    //var username = req.session.email.substr(0,req.session.email.indexOf("@")).substr(0,32);
    var username = req.session.email.substr(0, 32);
    return username;
}


/*================================================================
 ROUTES
 ================================================================*/



/*==================   ADMIN API - CUSTOMIZATION   ===========================*/
router.get("/admin/custom/", function(req, res, next) {
    // check if the admin is authenticated 
    if (req.session.xapi) {
        // Load the customization from DB
        Customization
            .findById(req.session.account.customization)
            .exec(function(err, custom) {
                if (err) res.status(500).json({
                    error: err
                });
                else if (custom)
                    res.status(200).json(custom);
                else res.status(200).json();
            });
    } else res.status(403).send('Unknown session');
});
// Function to save customization
function saveCustomization(custom, req, cb) {

    if (req.body.logo) custom.logo = req.body.logo;
    else custom.logo.enable = false;

    if (req.body.colors) {
        if (req.body.colors.color.indexOf("#") == 0) req.body.colors.color = req.body.colors.color.substr(1);
        custom.colors = req.body.colors;
    } else custom.colors.enable = false;

    if (req.body.login) custom.login = req.body.login;
    else custom.login.enable = false;

    if (req.body.app) custom.app = req.body.app;
    else custom.app.enable = false;

    if (req.body.app) custom.app = req.body.app;
    else custom.app.enable = false;

    custom.save(function(err, result) {
        if (err) cb(err);
        else cb(err, result);
    });
}
// When admin wants to save the customization
router.post("/admin/custom/", function(req, res, next) {
    // check if the admin is authenticated 
    if (req.session.xapi) {
        // retrieve the current Account in the DB
        Account
            .findById(req.session.account._id)
            .populate("customization")
            .exec(function(err, account) {
                if (err) res.status(500).json({
                    error: err
                });
                else if (account) {
                    // update the account
                    var custom;
                    if (account.customization) custom = account.customization;
                    else custom = new Customization();
                    // save the customization
                    saveCustomization(custom, req, function(err, result) {
                        if (err) res.status(500).json({
                            error: err
                        });
                        else {
                            account.customization = result;
                            // save the account with the customization id
                            account.save(function(err, result) {
                                if (err) res.status(500).json({
                                    error: err
                                });
                                else res.status(200).json({
                                    action: "save",
                                    status: 'done'
                                });
                            });
                        }
                    });
                } else res.status(500).json({
                    err: "not able to retrieve the account"
                });
            });
    } else res.status(403).send('Unknown session');
});

module.exports = router;