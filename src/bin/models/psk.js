const mongoose = require('mongoose');

const PskSchema = new mongoose.Schema({
    scope: { type: String },
    site_id: { type: String },
    ssid: { type: String },
    vlan_id: { type: Number, default: 0 },
    min: { type: Boolean, default: false },
    cap: { type: Boolean, default: false },
    num: { type: Boolean, default: false },
    spec: { type: Boolean, default: false },
    length: { type: Number, default: 12 }
});

if (global.config.mongo.encKey && global.config.mongo.sigKey) {
    const encrypt = require('mongoose-encryption');
    PskSchema.plugin(encrypt, { encryptionKey: global.config.mongo.encKey, signingKey: global.config.mongo.sigKey });
}


const Psk = mongoose.model('Psk', PskSchema);


module.exports = Psk;