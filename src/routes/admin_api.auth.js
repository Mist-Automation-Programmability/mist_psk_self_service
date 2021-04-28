/*================================================================
API:
Deal with all the web browser API call:
- users (to create/delete/... keys)
- admins (to retrieve/save the app parameters)
 ================================================================*/
var express = require('express');
var router = express.Router();
var serverHostname = require("../config.js").appServer.vhost;
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
            var cmd = global.appPath + '/bin/generate_app_certificate.sh ' + org_id + ' https://' + serverHostname + "/adfs/" + org_id + '/ ' + global.appPath + '/certs/';
            for (var i = 0; i < files.length; i++)
                fs.access(files[i], fs.F_OK, function(err) {
                    done++;
                    if (err) error = err;
                    if (done == files.length)
                        if (!error) console.log("SAML Ceritificates for " + serverHostname + "/" + org_id + " present.");
                        else {
                            exec(cmd, {
                                cwd: global.appPath + '/certs/'
                            }, function(error, stdout, stderr) {
                                if (error) {
                                    console.log(error);
                                    console.log(stderr);
                                    console.log(stdout);
                                } else {
                                    console.log("SAML Certificates created for " + serverHostname + "/" + org_id);
                                    i = files.length;
                                }
                            });
                        }
                });
        }
    }
}



/*==================  azure   ===========================*/
// Function to save the azure configuration
function save_azure(req, res) {
    // retrieve the current Account in the DB
    Account
        .findById(req.session.account_id)
        .populate("_azure")
        .exec(function(err, account) {
            if (err) res.status(500).send(err);
            else if (account) {
                // if the current account already has a azure configuration
                if (account.azure)
                // update it
                    Azure.findOneAndUpdate({
                    _id: account.azure
                }, req.body.config, function(err, result) {
                    if (err) res.status(500).send(err);
                    else {
                        account._google = result;
                        account.auth_method = "azure";
                        account.save(function(err, result) {
                            if (err) {
                                console.log(err)
                                res.status(500).send(err);
                            } else res.status(200).send();
                        });
                    }
                });
                // if the current account has no azure aconfiguration, create it
                else Azure(req.body.config).save(function(err, result) {
                    if (err) res.status(500).send(err);
                    else {
                        account._azure = result;
                        account.auth_method = "azure";
                        account.save(function(err, result) {
                            if (err) res.status(500).send(err);
                            else res.status(200).send();
                        });
                    }
                });
            } else res.status(400).send("Account not found");
        });
}
/*==================  Google   ===========================*/
// Function to save the Google configuration
function save_google(req, res) {
    // retrieve the current Account in the DB
    Account
        .findById(req.session.account_id)
        .populate("_google")
        .exec(function(err, account) {
            if (err) {
                console.log(err)
                res.status(500).send(err);
            } else if (account) {
                // if the current account already has a Google configuration
                if (account._google)
                // update it
                    Google.findOneAndUpdate({
                    _id: account._google
                }, req.body.config, function(err, result) {
                    console.log(err)
                    if (err) res.status(500).send(err);
                    else {
                        account._google = result;
                        account.auth_method = "google";
                        account.save(function(err, result) {
                            if (err) {
                                console.log(err)
                                res.status(500).send(err);
                            } else res.status(200).send();
                        });
                    }
                });
                // if the current account has no Google aconfiguration, create it
                else Google(req.body.config).save(function(err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).send(err);
                    } else {
                        account._google = result;
                        account.auth_method = "google";
                        account.save(function(err, result) {
                            if (err) {
                                console.log(err)
                                res.status(500).send(err);
                            } else res.status(200).send();
                        });
                    }
                });
            } else res.status(400).send("Account not found");
        });
}
/*==================  Okta   ===========================*/
// Function to save the Okta configuration
function save_okta(req, res) {
    // retrieve the current Account in the DB
    Account
        .findById(req.session.account_id)
        .populate("_okta")
        .exec(function(err, account) {
            if (err) {
                console.log(err)
                res.status(500).send(err);
            } else if (account) {
                // if the current account already has a Okta configuration
                if (account._okta)
                // update it
                    Okta.findOneAndUpdate({
                    _id: account._okta
                }, req.body.config, (err, result) => {
                    console.log(err)
                    if (err) res.status(500).send(err);
                    else {
                        account._google = result;
                        account.auth_method = "okta";
                        account.save(function(err, result) {
                            if (err) {
                                console.log(err)
                                res.status(500).send(err);
                            } else res.status(200).send();
                        });
                    }
                });
                // if the current account has no Okta aconfiguration, create it
                else Okta(req.body.config).save(function(err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).send(err);
                    } else {
                        account._okta = result;
                        account.auth_method = "okta";
                        account.save((err, result) => {
                            if (err) {
                                console.log(err)
                                res.status(500).send(err);
                            } else res.status(200).send();
                        });
                    }
                });
            } else res.status(400).send("Account not found");
        });
}
/*==================  SAML   ===========================*/
// Function to save the SAML configuration
function save_adfs(req, res) {
    genCertificate(req.session.mist.org_id);
    // retrieve the current Account in the DB
    Account
        .findById(req.session.account_id)
        .populate("_adfs")
        .exec(function(err, account) {
            if (err) {
                console.log(err)
                res.status(500).send(err);
            } else if (account) {
                // if the current account already has a SAML configuration
                if (account._adfs)
                // update it
                    Adfs.findOneAndUpdate({
                    _id: account._adfs
                }, req.body.config, function(err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).send(err);
                    } else {
                        account._google = result;
                        account.auth_method = "adfs";
                        account.save(function(err, result) {
                            if (err) {
                                console.log(err)
                                res.status(500).send(err);
                            } else res.status(200).send();
                        });
                    }
                });
                // if the current account has no SAML aconfiguration, create it
                else Adfs(req.body.config).save(function(err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).send(err);
                    } else {
                        account._adfs = result;
                        account.auth_method = "adfs";
                        account.save(function(err, result) {
                            if (err) res.status(500).send(err);
                            else res.status(200).send();
                        });
                    }
                });
            } else res.status(400).send("Account not found");
        });
}
/*================================================================
 ROUTES
 ================================================================*/
/*==================   AUTH API - COMMON   ===========================*/
// // When to admin loads the AUTH configuration page
// router.get("/", function(req, res, next) {
//     // check if the admin is authenticated 
//     if (req.session && req.session.mist) {
//         // generate the x509 certifiate if needed
//         genCertificate(req.session.account_id);
//         // retrieve the current Account in the DB
//         Account
//             .findById(req.session.account_id)
//             .populate("azure_ad")
//             .populate("adfs")
//             .exec(function(err, account) {
//                 if (err) res.status(500).send(err);
//                 else if (account) {
//                     // return values to web server
//                     res.status(200).json({
//                         azure_ad: account.azure_ad,
//                         adfs: account._adfs,
//                         signin: "https://" + serverHostname + "/login/" + account._id + "/",
//                         callback: "https://" + serverHostname + "/azure/" + account._id + "/callback",
//                         logout: "https://" + serverHostname + "/login/" + account._id + "/",
//                     });
//                     res.status(200).json();
//                 } else res.status(400).send("Account not found");
//             });
//     } else res.status(401).send()
// });

/*==================   AUTH API    ===========================*/

router.post("/:auth_method", function(req, res, next) {
    // check if the admin is authenticated 
    if (!req.session.mist) res.status(403).send('Unknown session');
    else if (!req.params.auth_method) res.status(400).send('Authentication method is missing');
    else if (!req.body.config) res.status(400).send("Authentication configuration is missing");
    else {
        switch (req.params.auth_method) {
            case "azure":
                save_azure(req, res);
                break;
            case "adfs":
                save_adfs(req, res);
                break;
            case "google":
                console.log("google")
                save_google(req, res);
                break;
            case "okta":
                save_okta(req, res);
                break;
        }
    }
});

/*==================   AUTH API - SAML   ===========================*/

router.get("/cert", (req, res) => {
    // generate the x509 certifiate if needed
    var file = global.appPath + '/certs/' + req.session.mist.org_id + ".xml";
    res.download(file);
});

module.exports = router;