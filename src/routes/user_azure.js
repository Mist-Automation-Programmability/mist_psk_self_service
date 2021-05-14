/*================================================================
AZUREAD:
deals with azure authentication for users
the req param "account_id" in the URL is used to identify the app account (so the Azure configuration)
================================================================*/
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const AzureAdOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;
const https = require('https');
const req = require("./../bin/req")


/*================================================================
 USER AZURE OAUTH
 ================================================================*/
/*================================================================
AZUREAD:
deals with AzureAD authentication 
Depending on the configuration, it will user Azure API to get user/groups informations or not
================================================================*/
/*================================================================
PASSPORT
================================================================*/
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

/*================================================================
FUNCTIONS
================================================================*/
// Azure API Call to retrieve Azure user information
function getUserDetails(organization, oid, access_token, callback) {
    const path = "/" + organization + "/users/" + oid + "?api-version=1.6";
    const options = {
        host: "graph.windows.net",
        port: 443,
        path: path,
        method: "GET",
        headers: {
            'Authorization': "Bearer " + access_token
        }
    };
    req.httpRequest(options, callback);
}
// Azure API Call to retrieve Azure user's groups
function getUserGroups(organization, oid, access_token, callback) {
    const path = "/" + organization + "/users/" + oid + "/memberOf?api-version=1.6";
    const options = {
        host: "graph.windows.net",
        port: 443,
        path: path,
        method: "GET",
        headers: {
            'Authorization': "Bearer " + access_token
        }
    };
    req.httpRequest(options, callback);
}



function checkUserAccount(azureAccount, oid, params, callback) {
    // retrieve the user information from Azure
    getUserDetails(azureAccount.tenant, oid, params.access_token, function(err, user) {
        if (err) console.log(err);
        // if the App configuration is not allowing Guest accounts and if the current user is not a Member of the domain
        else if (!azureAccount.allow_external_users && user.userType != "Member")
        // callback with the "external" error (means authentication rejected because the user is not a member of the domain)
            callback("external", user.mail);
        // if the app is configured to filter on userGroups, but it has not the required permissions from Azure, raise an error
        else if (azureAccount.user_groups.length > 0 && params.scope.indexOf("Directory.AccessAsUser.All") < 0)
            callback("permissions", user.mail);
        // if the app is configured to filter on licensed users, but the user doesn't have any license
        else if (!azureAccount.allow_unlicensed_users && (!user.assignedLicenses || user.assignedLicenses.length == 0))
            callback("license", user.mail);
        // if the app is configured to filter on userGroups and it has the required permissions from Azure
        else if (azureAccount.user_groups.length > 0)
        // retrieve the user's user groups
            getUserGroups(azureAccount.tenant, oid, params.access_token, function(err, memberOf) {
            let isMemberOf = false;
            var userGroups = [];
            // passes all the user groups to lower case
            azureAccount.user_groups.forEach(function(group) {
                    userGroups.push(group.toLowerCase());
                })
                // try to see if at least one of the user's user group is in the required user groups list
            memberOf.value.forEach(function(group) {
                    if (group.objectType == "Group" && userGroups.indexOf(group.displayName.toLowerCase()) > -1) isMemberOf = true;
                })
                // if the user belong to at least one required user group, callback without error
            if (isMemberOf) callback(null, user.mail);
            // if the user deson't belong to the required user groups, callback with error
            else callback("memberOf", user.mail);
        });
        // if the app is not configured to check the user groups, callback without error
        else callback(null, user.mail);
    });
}
//function to generate the AzureAD authentication error page
function renderError(error, user, req, res) {
    let message;
    if (error == "external")
        message = "User " + user + " is not allowed to access to this network because the account is an external account";
    else if (error == "memberOf")
        message = "User " + user + " does not belong to the required user groups";
    else if (error == "license")
        message = "User " + user + " does not any license to use this app";
    else if (error == "permissions")
        message = "Unable to retrieve memberOf information for user " + user + ". Please check the application permission in your Azure portal.";
    console.error("\x1b[31mERROR\x1b[0m:", message);
    res.status(401).render("error_azureAd", {
        exeption: error,
        user: user
    });
}
/*================================================================
MODULE
================================================================*/
function getAzureAdAccount(req, res, next) {
    // if Azure OAuth returns an error message
    if (req.query.error) {
        console.error("\x1b[31mERROR\x1b[0m:", "AzureAD error: " + req.query.error);
        if (req.query.error_description) console.error("\x1b[31mERROR\x1b[0m:", "AzureAD message: " + req.query.error_description.replace(/\+/g, " "));
        res.render('error', {
            status: req.query.error,
            message: req.query.error_description.replace(/\+/g, " ")
        });
    } else
    // retrieve the configuration from DB
    {
        if (req.session.org_id) var org_id = req.session.org_id
        else {
            var org_id = req.params.org_id;
            req.session.org_id = org_id;
        }
        Account
            .findOne({ org_id: org_id })
            .populate("_azure")
            .exec((err, account) => {
                if (err) res.status(500).json({ error: err });
                else if (account) {
                    req.session.account = account;

                    // Passport strategy to use for app authentication
                    passport.use(new AzureAdOAuth2Strategy({
                        clientID: account._azure.client_id,
                        clientSecret: account._azure.client_secret,
                        callbackURL: 'https://' + global.config.appServer.vhost + '/azure/callback',
                        resource: account._azure.resource,
                        tenant: account._azure.tenant
                    }, function(accessToken, refresh_token, params, profile, done) {
                        // currently we can't find a way to exchange access token by user info (see userProfile implementation), so
                        // you will need a jwt-package like https://github.com/auth0/node-jsonwebtoken to decode id_token and get waad profile
                        var waadProfile = jwt.decode(params.id_token);
                        // Even if Azure validates the login/pwd, check the app parameters (external user, user groups)
                        // checkUserAccount(account._azure, waadProfile.oid, params, function(error, email) {
                        //     console.log(error)
                        //     console.log(email)
                        //     if (error) renderError(error, email, req, res);
                        //     else done(null, waadProfile);
                        // })
                        done(null, waadProfile);
                    }));
                    next();
                } else res.render('error', {
                    status: 404,
                    message: "Page not found",
                    stack: {}
                });
            })
    }
}

/*================================================================
 USER AZURE OAUTH
 ================================================================*/
/* GET login page. Passport will redirect to Azure authentication page */
router.get('/:org_id/login', getAzureAdAccount,
    passport.authenticate('azure_ad_oauth2', { failureRedirect: '/', failureFlash: true })
);

/* GET callback page. Azure is sending the Authorizaton Code. Passport will deal with that */
router.get('/callback', getAzureAdAccount,
    passport.authenticate('azure_ad_oauth2', { failureRedirect: '/login' }),
    (req, res) => {
        if (req.session.passport.user.email) req.session.email = req.user.email;
        else req.session.email = null;
        if (req.user.name) req.session.name = req.user.name;
        else req.session.name = ""
        console.info("\x1b[32minfo\x1b[0m:", 'User ' + req.session.email + ' logged in');
        res.redirect('/portal/' + req.session.org_id);
    }
);

/* Handle Logout */
router.get('/:org_id/logout/', function(req, res) {
    const loginurl = "https://" + global.config.appServer.vhost + "/azure/" + req.session.mist.org_id + "/login"
    res.redirect("https://login.windows.net/" + req.session.account._azure.tenant + "/oauth2/logout?post_logout_redirect_uri=" + loginurl);
    req.logout();
    req.session.destroy();
    console.log("\x1b[32minfo\x1b[0m:", "User " + req.session.email + " is now logged out.");
});

module.exports = router;