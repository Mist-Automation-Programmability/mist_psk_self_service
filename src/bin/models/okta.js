const mongoose = require('mongoose');

const OktaSchema = new mongoose.Schema({
    audience: { type: String },
    client_id: { type: String },
    client_secret: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});


if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    const encrypt = require('mongoose-encryption');
    OktaSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}

const Okta = mongoose.model('Okta', OktaSchema);


// Pre save
OktaSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Okta;