var express = require('express');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var path = require('path');

var config = {}
try {
    config = require("./config")
} catch (e) {

    config = {
        appServer: {
            vhost: process.env.NODE_HOSTNAME || null,
            httpPort: process.env.NODE_PORT || 3000,
            enableHttps: process.env.NODE_HTTPS || false,
            httpsPort: process.env.NODE_PORT_HTTPS || 3443,
            httpsCertificate: process.env.NODE_HTTPS_CERT || null,
            httpsKey: process.env.NODE_HTTPS_KEY || null
        },
        mongo: {
            host: process.env.MONGO_HOSTNAME || null,
            base: process.env.MONGO_DB || "mpss",
            user: process.env.MONGO_USER || null,
            password: process.env.MONGO_PASSWORD || null
        },
        smtp: {
            host: process.env.SMTP_HOSTNAME || null,
            port: process.env.SMTP_PORT || 25,
            secure: process.env.SMTP_SECURE || false, // upgrade later with STARTTLS
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED || true
            },
            auth: {
                user: process.env.SMTP_USER || null,
                pass: process.env.SMTP_PASSWORD || null
            },
            from_name: process.env.SMTP_FROM_NAME || "Wi-Fi Access",
            from_email: process.env.SMTP_FROM_EMAIL || "wi-fi@corp.org",
            subject: process.env.SMTP_SUBJECT || "Your Personal Wi-Fi access code",
            logo_url: process.env.SMTP_LOGO || "https://cdn.mist.com/wp-content/uploads/logo.png",
            enable_qrcode: process.env.SMTP_ENABLE_QRCODE || true
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

var app = express();
// remove http header
app.disable('x-powered-by');
// log http request
app.use(morgan('\x1b[32minfo\x1b[0m: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]', {
    skip: function(req, res) { return res.statusCode < 400 && req.originalUrl != "/"; }
}));

//===============MONGODB=================
// configure mongo database
var mongoose = require('mongoose');
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


//===============APP=================
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
// express-session parameters:
// save sessions into mongodb 
app.use(session({
    secret: 'T9QrskYinhvSyt6NUrEcCaQdgez3',
    store: new MongoDBStore({
        uri: 'mongodb://' + mongo_host + '/express-session?authSource=admin',
        collection: 'mpss'
    }),
    rolling: true,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 30 * 60 * 1000 // 30 minutes
    },
    unset: "destroy"
}));

//===============PASSPORT=================
// passport is used to save authentication sessions
global.passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

//================ROUTES=================
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static('../bower_components'));


//===============ROUTES=================
// // Users Login and Logout 
var user = require('./routes/user');
app.use('/', user);
var user_api = require("./routes/user_api");
app.use("/api/user", user_api);
var user_api_psk = require("./routes/user_api.psk");
app.use("/api/user/psk", user_api_psk);
//Customization
var user_custom = require('./routes/user_api.custom');
app.use('/api/user/custom', user_custom);
// // User Interface
// var user = require('./routes/user');
// app.use('/login/', user);
// var portal = require('./routes/user');
// app.use('/portal/', portal);
//Azure AD
var azure = require('./routes/user_azure');
app.use('/azure/', azure);
//SAML
var adfs = require('./routes/user_adfs');
app.use('/adfs/', adfs);
//GOOGLE
var google = require('./routes/user_google');
app.use('/google/', google);
// //OPENID
// var openid = require('./routes/user_openid');
// app.use('/openid/', openid);
//OKTA
var okta = require('./routes/user_okta');
app.use('/okta/', okta);

//Admin Login
var admin = require('./routes/admin');
app.use('/admin', admin);
//Admin
var admin_api = require('./routes/admin_api');
app.use('/api/admin', admin_api);
//Admin Customization
var admin_api_custom = require('./routes/admin_api.custom');
app.use('/api/admin/custom', admin_api_custom);
//Admin
var admin_api_token = require('./routes/admin_api.token');
app.use('/api/admin/token', admin_api_token);
//Admin
var admin_api_psk = require('./routes/admin_api.psk');
app.use('/api/admin/psk', admin_api_psk);
//Admin
var admin_api_auth = require('./routes/admin_api.auth');
app.use('/api/admin/auth', admin_api_auth);
//Otherwise
app.get("*", function(req, res) {
    res.redirect("/login");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            stack: err
        });
        console.log(err);
    });
} else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        if (err.status == 404) err.message = "The requested url " + req.originalUrl + " was not found on this server.";
        res.status(err.status || 500);
        res.render('error', {
            status: err.status,
            message: err.message,
            stack: {}
        });
    });
}

module.exports = app;