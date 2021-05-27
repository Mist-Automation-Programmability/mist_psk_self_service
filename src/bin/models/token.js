const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    apitoken: { type: String },
    apitoken_id: { type: String },
    scope: { type: String },
    created_by: { type: String }
});

if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    const encrypt = require('mongoose-encryption');
    TokenSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}

const Token = mongoose.model('Token', TokenSchema);


module.exports = Token;