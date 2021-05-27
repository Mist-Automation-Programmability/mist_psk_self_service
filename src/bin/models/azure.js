const mongoose = require('mongoose');

const AzureSchema = new mongoose.Schema({
    client_id: { type: String },
    client_secret: { type: String },
    tenant: { type: String },
    resource: { type: String },
    allow_external_users: { type: Boolean, default: false },
    allow_unlicensed_users: { type: Boolean, default: false },
    user_groups: [{ type: String }]
});

if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    const encrypt = require('mongoose-encryption');
    AzureSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}

const Azure = mongoose.model('Azure', AzureSchema);


module.exports = Azure;