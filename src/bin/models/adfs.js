var mongoose = require('mongoose');

var AdfsSchema = new mongoose.Schema({
    metadata: { type: String, required: true },
    entry_point: { type: String, required: true },
    entity_id: { type: String, required: true },
    login_url: { type: String, required: true },
    logout_url: { type: String, required: true },
    certs: [{ type: String, required: false }],
    created_at: { type: Date },
    updated_at: { type: Date }
});

if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    var encrypt = require('mongoose-encryption');
    AdfsSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}

var Adfs = mongoose.model('Adfs', AdfsSchema);


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