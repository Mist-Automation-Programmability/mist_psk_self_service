/*================================================================
ADMIN:
- ACS Oauth (to authenticate administrators)
- Display Admin Web page
 ================================================================*/
var express = require('express');
var router = express.Router();
var mist_user = require("../bin/mist_user");
var send_mail = require("../bin/send_mail");
/*================================================================
VARS
================================================================*/
i18n = {
    languages: [
        { short: "en", long: "English" },
        { short: "fr", long: "Francais" }
    ],
    login: {
        en: {
            title: "Welcome to the Mist PSK Self-Service Portal",
            content: "To get your personal key to be able to connect to the network, please click on the button below to authenticate with your domain credentials.",
            login: "Log In"
        },
        fr: {
            title: "Bienvenue sur le portail libre-service Mist PSK ",
            content: "Pour obtenir votre clé personnelle afin de pouvoir vous connecter au réseau, veuillez cliquer sur le bouton ci-dessous pour vous authentifier avec vos identifiants de domaine.",
            login: "Connexion"
        }
    },
    portal: {
        en: {
            hi: "Hi",
            title: "Requesting a WiFi key is a one-button process",
            subtitle: "You need to know a few things first:",
            rows: [{
                    text: "Corporate laptops do not need a key. They are automatically configured to connect to the right network.",
                    icon: "business"
                },
                {
                    text: "Your key is yours. Do not share it with others. You're responsible for all activities that uses your key.",
                    icon: "fingerprint"
                },
                {
                    text: "If your use of our network causes problems for others you'll be disconnected.",
                    icon: "block"
                },
                {
                    text: "Each key permits up to three (3) concurrent device connections.",
                    icon: "recent_actors"
                },
                {
                    text: "If you already have a key and request another one your old key will stop working.",
                    icon: "vpn_key"
                },
                {
                    text: "Keyed networks do not have access to any internal resources. They behave as if you were using a network off-site.",
                    icon: "cloud_done"
                }
            ],
            getMyKey: "Get a Key",
            deliverByEmail: "Send By Email",
            displayQrCode: "Configuration QRCode",
            revoke: "Delete My Key",
            keyCreatedSuccesfully: "Key succesfully created!",
            keyDeletededSuccesfully: "Key succesfully deleted!",
            keySentSuccesfully: "Key sent succesfully to {email}!"
        },
        fr: {
            hi: "Bonjour",
            title: "Demander une clé Wi-Fi se fait en un clic",
            subtitle: "Vous devez savoir quelques points avant de commencer:",
            rows: [{
                    text: "Les ordinateurs portables d'entreprise n'ont pas besoin de clé. Ils sont configurés pour se connecter automatiquement au bon réseau. ",
                    icon: "business"
                },
                {
                    text: "Votre clé est la vôtre. Ne la partagez pas avec d'autres. Vous êtes responsable de toutes les activités faites avec votre clé. ",
                    icon: "fingerprint"
                },
                {
                    text: "Si votre utilisation du réseau cause des problèmes à d'autres, vous serez déconnecté. ",
                    icon: "block"
                },
                {
                    text: "Chaque clé permet jusqu'à trois (3) connexions d'appareils simultanées. ",
                    icon: "recent_actors"
                },
                {
                    text: "Si vous avez déjà une clé et que vous en demandez une autre, votre ancienne clé cessera de fonctionner. ",
                    icon: "vpn_key"
                },
                {
                    text: "Les réseaux sécurisés par clé n'ont accès à aucune ressource interne. Ils se comportent comme si vous étiez sur un réseau hors site.",
                    icon: "cloud_done"
                }
            ],
            getMyKey: "Obtenir une clé",
            deliverByEmail: "Envoyer par E-mail ",
            displayQrCode: "QRCode de Configuration",
            revoke: "Supprimer ma clé",
            keyCreatedSuccesfully: "Clé créée avec succès!",
            keyDeletededSuccesfully: "Clé supprimée avec succès!",
            keySentSuccesfully: "Clé envoyée à {email}!"
        }
    }
}

/*================================================================
 LOG IN
 ================================================================*/
router.get("/auth_url/:org_id", function(req, res) {
    if (req.session.mist && req.session.mist.auth_method) {
        res.json({ url: "/" + req.session.mist.auth_method + "/" + req.session.mist.org_id + "/login" })
    } else if (req.params.org_id) {
        mist_user.getAccount(req.params.org_id, (err, mist) => {
            if (err) res.status(err.code).send(err.error);
            else if (mist)  {
                req.session.mist = mist
                res.json({ url: "/" + mist.auth_method + "/" + req.params.org_id + "/login" })
            } else res.status(404).send("Not Found")
        })
    } else res.status(401).send()

})

router.get("/myInfo/:org_id", (req, res) => {
    if (req.session && req.session.passport) {
        data = {
            user: {
                name: req.session.name
            },
            logout_url: "/" + req.session.mist.auth_method + "/" + req.session.mist.org_id + "/logout"
        }
        if (global.config.smtp && global.config.smtp.host) data.user.email = req.session.email
        res.json(data)
    } else res.status(401).send()
})


/*================================================================
 EMAIL
 ================================================================*/
// When user wants to receive the key one more time (same key sent by email)
router.post("/email", function(req, res) {
    // check if the user is authenticated 
    if (req.session.mist) {
        if (req.body.psk && req.body.ssid) {
            send_mail.send(req.session.email, req.session.name, req.body.ssid, req.body.psk, (err, info) => {
                if (err) {
                    console.log(err)
                    res.status(500).send()
                } else if (info) {
                    console.log(info)
                    res.send()
                } else res.send()
            })
        } else res.status(400).send()
    } else res.status(401);
});


/*================================================================
I18N
 ================================================================*/
function getText(mist, lang, page) {
    if (mist.customization)
        data = mist.customization[page].text[lang]
    else data = i18n[page][lang]
    return { i18n: data }
}

router.get("/languages", (req, res) => {
    if (req.session.lang) var lang = req.session.lang
    else var lang = "en"
    res.json({ languages: i18n.languages, default: lang })
})

router.get("/text/:org_id", (req, res) => {
    if (req.query.page) {
        if (req.query.lang) {
            var lang = req.query.lang
            req.session.lang = lang
        } else var lang = "en"

        if (req.session.mist) {
            var text = getText(req.session.mist, lang, req.query.page)
            res.json(text)
        } else if (req.params.org_id) {
            mist_user.getAccount(req.params.org_id, (err, mist) => {
                if (err) res.status(err.code).send(err.error);
                else if (mist)  {
                    req.session.mist = mist
                    text = getText(req.session.mist, lang, req.query.page)

                    res.json(text)
                } else res.status(404).send("Not Found")
            })
        } else res.status(401).send()

    } else res.status(400).send()
})

/*================================================================
CUSTOMIZATION FUNCTION
================================================================*/
function getCustom(req, res, next) {
    if (!req.session.xapi || !req.session.passport) {
        if (req.session.xapi) res.redirect('/login/' + req.session.uurl)
        else res.redirect('/login/');
    } else if (req.session.account.customization)
        Customization
        .findById(req.session.account.customization)
        .exec(function(err, custom) {
            if (!err) req.custom = custom;
            next();
        })
    else next();
}
/*================================================================
CUSTOMIZATION ROUTES
================================================================*/
router.get('/', function(req, res, next) {
    res.render('user', {
        title: 'Mist PSK Self-Service',
        custom: req.custom
    });
});


module.exports = router;