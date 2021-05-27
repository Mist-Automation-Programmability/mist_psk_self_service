const mongoose = require('mongoose');

const AdfsSchema = new mongoose.Schema({
    metadata: { type: String },
    entry_point: { type: String },
    entity_id: { type: String },
    login_url: { type: String },
    logout_url: { type: String },
    certs: [{ type: String }]
});

if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    const encrypt = require('mongoose-encryption');
    AdfsSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}

const Adfs = mongoose.model('Adfs', AdfsSchema);


module.exports = Adfs;