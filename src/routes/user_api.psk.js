/*================================================================
API:
Deal with all the web browser API call:
- users (to create/delete/... keys)
- admins (to retrieve/save the app parameters)
 ================================================================*/
var express = require('express');
var router = express.Router();
var mist_psk = require("../bin/mist_psk.js");


/*================================================================
 FUNCTIONS
 ================================================================*/
function generatePsk(psk_settings) {
    var result = [];
    var characters = "";
    if (psk_settings.min) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (psk_settings.cap) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (psk_settings.num) characters += '0123456789';
    if (psk_settings.spec) characters += '!@#$%^&*';
    var charactersLength = characters.length;
    for (var i = 0; i < psk_settings.length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }
    return result.join('');
}

// Mist API call to retrieve Guest psks based on the username
function getPsk(req, callback) {
    //var username = generateUsername(req);
    // ACS API call
    mist_psk.getPsks(req.session.mist, req.session.email.replace("@", "_"), (err, psks) => {
        if (err) callback(err);
        else {
            var psk;
            // If ACS filtering didn't work, we'll get many psk. trying to find the right one
            if (psks.length > 1) {
                psks.forEach(function(tempPsk) {
                    if (tempPsk.name == username.replace("@", "_")) psk = tempPsk;
                });
                // if ACS filtering returned 1 account
            } else if (psks.length == 1) psk = psks[0];

            callback(null, psk);
        }
    });
}

// ACS API call to create a new Guest account
function createPsk(req, callback) {
    var psk = {
        name: req.session.email.replace("@", "_"),
        ssid: req.session.mist.ssid,
        vlan_id: req.session.mist.vlan_id,
        passphrase: generatePsk(req.session.mist.psk)
    };
    mist_psk.createPsk(req.session.mist, psk, (err, psk) => {
        if (err) callback(err);
        else callback(null, psk);
    });
}

// ACS API call to delete a Guest account
function deletePsk(req, psk, callback) {
    // if we get the account, removing it
    if (psk) {
        mist_psk.deletePsk(req.session.mist, psk.id, (err) => {
            callback(err);
        });
    } else callback({ code: 400, error: "PSK is missing" });
}

// ACS API call to deliver a Guest account by email
function deliverCredentialByEmail(req, psk, callback) {
    if (psk) {
        var hmCredentialDeliveryInfoVo = {
            email: req.session.email,
            credentialId: psk.id,
            deliverMethod: "EMAIL"
        };
    } else callback();
}


/*================================================================
 ROUTES
 ================================================================*/

/*==================   USER API   ===========================*/

// When user wants to get a new key
router.post("/", (req, res) => {
    // check if the user is authenticated 
    if (!req.session.mist) res.status(401).send("Unknown session")
        // preview mode (passport authentication only used by users)
    else if (!req.session.passport) res.json({ passphrase: "passphrase", ssid: "ssid" })
        // authenticated user mode
        // retrieve the account details (to have the account_id)
    else getPsk(req, (err, psk) => {
        if (err) res.status(err.code).send(err.error)
        else if (psk) {
            deletePsk(req, psk, (err) => {
                if (err) res.status(err.code).send(err.error)
                else createPsk(req, (err, new_psk) => {
                    if (err) res.status(err.code).send(err.error)
                    else res.json(new_psk)
                })
            })

        } else {
            createPsk(req, (err, new_psk) => {
                if (err) res.status(err.code).send(err.error)
                else res.json(new_psk)
            })
        }
    })
});

// to let the web app know if the user already has a key (will disable buttons based on this)
router.get("/:org_id", (req, res) => {
    // check if the user is authenticated 
    if (!req.session.mist) res.status(401).send("Unknown session")
        // preview mode
    else if (req.params.org_id == "preview") res.json({ passphrase: "passphrase", ssid: "ssid" })
        // authenticated user mode
        // retrieve the account details (to have the account_id)
    else getPsk(req, (err, psk) => {
        if (err) {
            console.log(err)
            res.status(err.code).send(err.error)
        } else if (psk) res.json(psk)
        else res.send()
    });
})


// When user wants to delete its key
router.delete("/", (req, res) => {
    // check if the user is authenticated 
    if (!req.session.mist) res.status(401).send("Unknown session")
        // preview mode (passport authentication only used by users)
    else if (!req.session.passport) res.send()
        // authenticated user mode
        // retrieve the account details (to have the account_id)
    else getPsk(req, function(err, psk) {
        if (err) res.status(err.code).send(err.error)
            // try to delete the current key
        else if (psk) deletePsk(req, psk, (err) => {
            console.log(err)
            if (err) res.status(err.code).send(err.error)
            else res.send()
        });
        else res.status(404).send()
    });
});


module.exports = router;