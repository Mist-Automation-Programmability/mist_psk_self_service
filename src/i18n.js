module.exports = {
    i18n_default: "en",
    languages: [
        { short: "en", long: "English" },
        { short: "fi", long: "Finnish" },
        { short: "fr", long: "French" },
        { short: "de", long: "German" },
        { short: "it", long: "Italian" },
        { short: "pt", long: "Portuguese" },
        { short: "es", long: "Spanish" },
        { short: "se", long: "Swedish" },
    ],
    en: {
        login: {
            title: "Welcome to the Mist PSK Self-Service Portal",
            text: "To get your personal key to be able to connect to the network, please click on the button below to authenticate with your domain credentials.",
            button: "Log In"
        },
        portal: {
            title: "Requesting a WiFi key is a one-button process",
            text: "Hi {username}! You need to know a few things first:",
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
                    text: "If you already have a key and request another one your old key will stop working.",
                    icon: "vpn_key"
                },
                {
                    text: "Keyed networks do not have access to any internal resources. They behave as if you were using a network off-site.",
                    icon: "cloud_done"
                }
            ],
            create_button: "Get a Key",
            email_button: "Send By Email",
            qrcode_button: "Configuration QRCode",
            delete_button: "Delete My Key",
            logout_button: "Logout",
            keyCreatedSuccesfully: "Key successfully created!",
            keyDeletededSuccesfully: "Key successfully deleted!",
            keySentSuccesfully: "Key sent successfully to {email}!"
        }
    },
    fr: {
        login: {
            title: "Bienvenue sur le portail libre-service Mist PSK",
            text: "Pour obtenir votre clé personnelle afin de pouvoir vous connecter au réseau, veuillez cliquer sur le bouton ci-dessous pour vous authentifier avec vos identifiants de domaine.",
            button: "Connexion"
        },
        portal: {
            title: "Demander une clé Wi-Fi se fait en un clic",
            text: "Bonjour {username}! Vous devez savoir quelques points avant de commencer:",
            rows: [{
                    text: "Les ordinateurs portables d'entreprise n'ont pas besoin de clé. Ils sont configurés pour se connecter automatiquement au bon réseau.",
                    icon: "business"
                },
                {
                    text: "Votre clé est la vôtre. Ne la partagez pas avec d'autres. Vous êtes responsable de toutes les activités faites avec votre clé.",
                    icon: "fingerprint"
                },
                {
                    text: "Si votre utilisation du réseau cause des problèmes à d'autres, vous serez déconnecté.",
                    icon: "block"
                },
                {
                    text: "Si vous avez déjà une clé et que vous en demandez une autre, votre ancienne clé cessera de fonctionner.",
                    icon: "vpn_key"
                },
                {
                    text: "Les réseaux sécurisés par clé n'ont accès à aucune ressource interne. Ils se comportent comme si vous étiez sur un réseau hors site.",
                    icon: "cloud_done"
                }
            ],
            create_button: "Obtenir une clé",
            email_button: "Envoyer par E-mail",
            qrcode_button: "QRCode de Configuration",
            delete_button: "Supprimer ma clé",
            logout_button: "Déconnexion",
            keyCreatedSuccesfully: "Clé créée avec succès!",
            keyDeletededSuccesfully: "Clé supprimée avec succès!",
            keySentSuccesfully: "Clé envoyée à {email}!"
        }
    }
}