const mongoose = require('mongoose');

const GoogleSchema = new mongoose.Schema({
    domains: [{ type: String }]
});

if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    const encrypt = require('mongoose-encryption');
    GoogleSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}

const Google = mongoose.model('Google', GoogleSchema);


module.exports = Google;