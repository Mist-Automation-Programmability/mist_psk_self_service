const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    apitoken: { type: String },
    apitoken_id: { type: String },
    scope: { type: String },
    created_by: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});

if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    const encrypt = require('mongoose-encryption');
    TokenSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}

const Token = mongoose.model('Token', TokenSchema);


// Pre save
TokenSchema.pre('save', function(next) {
    const now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Token;