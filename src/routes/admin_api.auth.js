/*================================================================
API:
Deal with all the web browser API call:
- users (to create/delete/... keys)
- admins (to retrieve/save the app parameters)
 ================================================================*/
var express = require('express');
var router = express.Router();
var Account = require("../bin/models/account");
var Azure = require("../bin/models/azure");
var Adfs = require("../bin/models/adfs");
var Google = require("../bin/models/google");
var Okta = require("../bin/models/okta");
var fs = require('fs');
var exec = require('child_process').exec;

/*================================================================
 FUNCTIONS
 ================================================================*/
// Generate x509 certificate for SAML 
function genCertificate(org_id) {
    var files = [
        global.appPath + "/certs/" + org_id,
        global.appPath + "/certs/" + org_id,
        global.appPath + "/certs/" + org_id
    ];
    for (var i = 0; i < files.length; i++) {
        if (!fs.existsSync(files[i])) {
            i = 999
            done = 0;
            var error;
            var cmd = global.appPath + '/bin/generate_app_certificate.sh ' + org_id + ' https://' + global.config.appServer.vhost + "/adfs/" + org_id + '/ ' + global.appPath + '/certs/';
            for (var i = 0; i < files.length; i++)
                fs.access(files[i], fs.F_OK, function(err) {
                    done++;
                    if (err) error = err;
                    if (done == files.length)
                        if (!error) console.info("SAML Ceritificates for " + global.config.appServer.vhost + "/" + org_id + " present.");
                        else {
                            exec(cmd, {
                                cwd: global.appPath + '/certs/'
                            }, function(error, stdout, stderr) {
                                if (error) {
                                    console.error(error);
                                } else {
                                    console.info("SAML Certificates created for " + global.config.appServer.vhost + "/" + org_id);
                                    i = files.length;
                                }
                            });
                        }
                });
        }
    }
}

function save_account(res, account) {
    account.save(function(err) {
        if (err) {
            console.error(err);
            res.status(500).send("Unable to save account");
        } else res.status(200).send();
    });

}

function update_adfs(req, res, account) {
    genCertificate(req.session.mist.org_id);
    if (account._adfs)
        Adfs.findOne({ _id: account._adfs }, (err, data) => {
            for (const [key, value] of Object.entries(req.body.config)) {
                if (!key.startsWith("_")) {
                    data[key] = req.body.config[key]
                }
            }
            data.save((err, saved_data) => {
                if (err) res.status(500).send("Unable to save data");
                else {
                    account._adfs = saved_data._id;
                    account.auth_method = "adfs";
                    save_account(res, account);
                }
            })
        })
    else
        Adfs(req.body.config).save(function(err, result) {
            if (err) {
                console.error(err)
                res.status(500).send("Unable to save data");
            } else {
                account._adfs = result;
                account.auth_method = "adfs";
                save_account(res, account);
            }
        });
}


function update_azure(req, res, account) {
    if (account._azure)
        Azure.findOne({ _id: account._azure }, (err, data) => {
            for (const [key, value] of Object.entries(req.body.config)) {
                if (!key.startsWith("_")) {
                    data[key] = req.body.config[key]
                }
            }
            data.save((err, saved_data) => {
                if (err) res.status(500).send("Unable to save data");
                else {
                    account._azure = saved_data._id;
                    account.auth_method = "azure";
                    save_account(res, account);
                }
            })
        })
    else
        Azure(req.body.config).save(function(err, result) {
            if (err) {
                console.error(err)
                res.status(500).send("Unable to save data");
            } else {
                account._azure = result;
                account.auth_method = "azure";
                save_account(res, account);
            }
        });
}

function update_google(req, res, account) {
    if (account._google)
        Google.findOne({ _id: account._google }, (err, data) => {
            for (const [key, value] of Object.entries(req.body.config)) {
                if (!key.startsWith("_")) {
                    data[key] = req.body.config[key]
                }
            }
            data.save((err, saved_data) => {
                if (err) res.status(500).send("Unable to save data");
                else {
                    account._google = saved_data._id;
                    account.auth_method = "google";
                    save_account(res, account);
                }
            })
        })
    else
        Google(req.body.config).save(function(err, result) {
            if (err) {
                console.error(err)
                res.status(500).send("Unable to save data");
            } else {
                account._google = result;
                account.auth_method = "google";
                save_account(res, account);
            }
        });
}

function update_okta(req, res, account) {
    if (account._okta)
        Okta.findOne({ _id: account._okta }, (err, data) => {
            for (const [key, value] of Object.entries(req.body.config)) {
                if (!key.startsWith("_")) {
                    data[key] = req.body.config[key]
                }
            }
            data.save((err, saved_data) => {
                if (err) res.status(500).send("Unable to save data");
                else {
                    account._okta = saved_data;
                    account.auth_method = "okta";
                    save_account(res, account);
                }
            })
        })
    else
        Okta(req.body.config).save(function(err, result) {
            if (err) {
                console.error(err)
                res.status(500).send("Unable to save data");
            } else {
                account._okta = result;
                account.auth_method = "okta";
                save_account(res, account);
            }
        });
}

/*==================  SAML   ===========================*/
// Function to save the SAML configuration
function save_auth(req, res, auth_type) {
    // retrieve the current Account in the DB
    Account
        .findOne({ org_id: req.session.mist.org_id })
        .populate("_" + auth_type)
        .exec((err, account) => {
            if (err) {
                console.error(err)
                res.status(500).send("Uanable to save account");
            } else if (account) {
                switch (auth_type) {
                    case "adfs":
                        update_adfs(req, res, account);
                        break;
                    case "azure":
                        update_azure(req, res, account);
                        break;
                    case "google":
                        update_google(req, res, account);
                        break;
                    case "okta":
                        update_okta(req, res, account);
                        break;
                    default:
                        res.status(400).send("Unknown auth method");
                        break;
                }
            } else res.status(400).send("Account not found");
        });
}
/*================================================================
 ROUTES
 ================================================================*/
/*==================   AUTH API - SAML   ===========================*/

router.get("/cert", (req, res) => {
    // generate the x509 certifiate if needed
    var file = global.appPath + '/certs/' + req.session.mist.org_id + ".xml";
    res.download(file);
});

/*==================   AUTH API    ===========================*/

router.get("/:auth_method", (req, res) => {
    var data = {
        configured: false,
        config: {}
    }
    if (req.session.mist) {
        Account.findOne({ org_id: req.session.mist.org_id })
            .populate('_' + req.params.auth_method)
            .exec((err, account) => {
                if (err) {
                    console.error(err)
                    res.status(500).send("Unable to save auth method")
                } else if (account && account["_" + req.params.auth_method]) {
                    if (account["_" + account.auth_method]) {
                        data.configured = true
                        data.config = account["_" + req.params.auth_method]
                        delete data.config._id
                        delete data.config.__v
                    }
                    res.json(data)
                } else res.send()
            })
    } else res.status(401).send();
})

router.post("/:auth_method", (req, res) => {
    // check if the admin is authenticated 
    if (!req.session.mist) res.status(401).send();
    else if (!req.params.auth_method) res.status(400).send('Authentication method is missing');
    else if (!req.body.config) res.status(400).send("Authentication configuration is missing");
    else save_auth(req, res, req.params.auth_method)
});


module.exports = router;