const mongoose = require('mongoose');

const OktaSchema = new mongoose.Schema({
    audience: { type: String },
    client_id: { type: String },
    client_secret: { type: String }
});


if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    const encrypt = require('mongoose-encryption');
    OktaSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}

const Okta = mongoose.model('Okta', OktaSchema);

module.exports = Okta;