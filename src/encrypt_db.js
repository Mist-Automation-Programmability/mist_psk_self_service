var session = require('express-session');
var path = require('path');

/*================================================================
 LOAD APP SETTINGS
 ================================================================*/
function stringToBool(val, def_val) {
    if (val) {
        val = val.toLowerCase()
        if (val == "true" || val == "1") return true
        else if (val == "false" || val == "0") return false
    }
    return def_val
}

var config = {}
try {
    config = require("./config")
} catch (e) {

    config = {
        appServer: {
            vhost: process.env.NODE_HOSTNAME || null,
            httpPort: process.env.NODE_PORT || 3000,
            enableHttps: stringToBool(process.env.NODE_HTTPS, false),
            httpsPort: process.env.NODE_PORT_HTTPS || 3443,
            httpsCertificate: process.env.NODE_HTTPS_CERT || null,
            httpsKey: process.env.NODE_HTTPS_KEY || null
        },
        mongo: {
            host: process.env.MONGO_HOSTNAME || null,
            base: process.env.MONGO_DB || "mpss",
            user: process.env.MONGO_USER || null,
            password: process.env.MONGO_PASSWORD || null,
            encKey: process.env.MONGO_ENC_KEY || null,
            sigKey: process.env.MONGO_SIG_KEY || null
        },
        smtp: {
            host: process.env.SMTP_HOSTNAME || null,
            port: process.env.SMTP_PORT || 25,
            secure: stringToBool(process.env.SMTP_SECURE, false), // upgrade later with STARTTLS
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: stringToBool(process.env.SMTP_REJECT_UNAUTHORIZED, true)
            },
            auth: {
                user: process.env.SMTP_USER || null,
                pass: process.env.SMTP_PASSWORD || null
            },
            from_name: process.env.SMTP_FROM_NAME || "Wi-Fi Access",
            from_email: process.env.SMTP_FROM_EMAIL || "wi-fi@corp.org",
            subject: process.env.SMTP_SUBJECT || "Your Personal Wi-Fi access code",
            logo_url: process.env.SMTP_LOGO || "https://cdn.mist.com/wp-content/uploads/logo.png",
            enable_qrcode: stringToBool(process.env.SMTP_ENABLE_QRCODE, true)
        },
        google: {
            client_id: process.env.GOOGLE_CLIENTID || "",
            client_secret: process.env.GOOGLE_CLIENTSECRET || ""
        }
    }
} finally {
    global.config = config
}

global.appPath = path.dirname(require.main.filename).replace(new RegExp('/bin$'), "");

/*================================================================
 MONGO
 ================================================================*/
// configure mongo database
var mongoose = require('mongoose');
const { exit } = require('process');
mongoose.Promise = require('bluebird');
// retrieve mongodb parameters from config file
const db = mongoose.connection;

db.on('error', console.error.bind(console, '\x1b[31mERROR\x1b[0m: unable to connect to mongoDB on ' + global.config.mongo.host + ' server'));
db.once('open', function() {
    console.info("\x1b[32minfo\x1b[0m:", "Connected to mongoDB on " + global.config.mongo.host + " server");
});

// connect to mongodb
var mongo_host = global.config.mongo.host
if (global.config.mongo.user && global.config.mongo.password) mongo_host = global.config.mongo.user + ":" + encodeURI(global.config.mongo.password) + "@" + mongo_host
mongoose.connect('mongodb://' + mongo_host + '/' + global.config.mongo.base + "?authSource=admin", { useNewUrlParser: true, useUnifiedTopology: true });


const AdfsSchema = new mongoose.Schema({
    metadata: { type: String },
    entry_point: { type: String },
    entity_id: { type: String },
    login_url: { type: String },
    logout_url: { type: String },
    certs: [{ type: String }],
    created_at: { type: Date },
    updated_at: { type: Date }
});
const AzureSchema = new mongoose.Schema({
    client_id: { type: String },
    client_secret: { type: String },
    tenant: { type: String },
    resource: { type: String },
    allow_external_users: { type: Boolean, default: false },
    allow_unlicensed_users: { type: Boolean, default: false },
    user_groups: [{ type: String }],
    created_at: { type: Date },
    updated_at: { type: Date }
});
const GoogleSchema = new mongoose.Schema({
    domains: [{ type: String }],
    created_at: { type: Date },
    updated_at: { type: Date }
});
const OktaSchema = new mongoose.Schema({
    audience: { type: String },
    client_id: { type: String },
    client_secret: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});
const TokenSchema = new mongoose.Schema({
    apitoken: { type: String },
    apitoken_id: { type: String },
    scope: { type: String },
    created_by: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});
const PskSchema = new mongoose.Schema({
    scope: { type: String },
    site_id: { type: String },
    ssid: { type: String },
    vlan_id: { type: Number, default: 0 },
    min: { type: Boolean, default: false },
    cap: { type: Boolean, default: false },
    num: { type: Boolean, default: false },
    spec: { type: Boolean, default: false },
    length: { type: Number, default: 12 },
    created_at: { type: Date },
    updated_at: { type: Date }
});


if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    var encrypt = require('mongoose-encryption');
    AdfsSchema.plugin(encrypt.migrations, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
    const Adfs = mongoose.model('Adfs', AdfsSchema);
    Adfs.migrateToA(function(err) {
        if (err) { throw err; }
        console.log('AdfsSchema Migration successful');
    });
    AzureSchema.plugin(encrypt.migrations, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
    const Azure = mongoose.model('Azure', AzureSchema);
    Azure.migrateToA(function(err) {
        if (err) { throw err; }
        console.log('AzureSchema Migration successful');
    });
    GoogleSchema.plugin(encrypt.migrations, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
    const Google = mongoose.model('Google', GoogleSchema);
    Google.migrateToA(function(err) {
        if (err) { throw err; }
        console.log('GoogleSchema Migration successful');
    });
    OktaSchema.plugin(encrypt.migrations, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
    const Okta = mongoose.model('Okta', OktaSchema);
    Okta.migrateToA(function(err) {
        if (err) { throw err; }
        console.log('OktaSchema Migration successful');
    });
    PskSchema.plugin(encrypt.migrations, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
    const Psk = mongoose.model('Psk', PskSchema);
    Psk.migrateToA(function(err) {
        if (err) { throw err; }
        console.log('PskSchema Migration successful');
    });
    TokenSchema.plugin(encrypt.migrations, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
    const Token = mongoose.model('Token', TokenSchema);
    Token.migrateToA(function(err) {
        if (err) { throw err; }
        console.log('TokenSchema Migration successful');
    });

}

exit(0)