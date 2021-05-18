var mongoose = require('mongoose');

var GoogleSchema = new mongoose.Schema({
    domains: [{ type: String, required: false }],
    created_at: { type: Date },
    updated_at: { type: Date }
});

if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    var encrypt = require('mongoose-encryption');
    GoogleSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}

var Google = mongoose.model('Google', GoogleSchema);


// Pre save
GoogleSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Google;