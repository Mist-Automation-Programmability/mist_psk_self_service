const mongoose = require('mongoose');

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

if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    const encrypt = require('mongoose-encryption');
    AdfsSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}

const Adfs = mongoose.model('Adfs', AdfsSchema);


// Pre save
AdfsSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Adfs;