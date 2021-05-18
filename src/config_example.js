/******************************************************************************
 *                                 NOTES                                    *
 *
 *      This file is an example
 *      Please move this file config_example.js to config.js
 *      and chage the values to match your configuration
 *
 ******************************************************************************/

/******************************************************************************
 *                                 SERVER                                    *
 ******************************************************************************/
module.exports.appServer = {
    vhost: "localhost",
    // Enable HTTPS directly with NodeJS. 
    // Set to false if you are using a reverse proxy to manage HTTPS (nginx, apache, ...)
    enableHttps: true,
    // used if enableHttps = true
    // certificate name. The certificate has to be installed into certs folder
    httpsCertificate: "default.pem",
    // key name. The key has to be installed into certs folder, without password
    httpsKey: "default.key"
}

/******************************************************************************
 *                                MongoDB                                    *
 ******************************************************************************/
module.exports.mongo = {
    host: "localhost",
    base: "mpss",
    user: "mongo_user",
    password: "mongo_password",
    encKey: "SOME_32BYTE_BASE64_STRING", //openssl rand -base64 32; 
    sigKey: "SOME_64BYTE_BASE64_STRING" //openssl rand -base64 64;
}

module.exports.smtp = {
    host: "mail.corp.org",
    port: 25,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: "user@corp.org",
        pass: "secret"
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    },
    from_name: "Wi-Fi Access",
    from_email: "wi-fi@corp.org",
    subject: "Your Personal Wi-Fi access code",
    logo_url: "https://cdn.mist.com/wp-content/uploads/logo.png",
    enable_qrcode: true
}

module.exports.google = {
    client_id: "",
    client_secret: ""
}