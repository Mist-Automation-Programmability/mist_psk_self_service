const mongoose = require('mongoose');

const PskSchema = new mongoose.Schema({
    scope: { type: String, required: true },
    site_id: { type: String, required: false },
    ssid: { type: String, required: true },
    vlan_id: { type: Number, default: 0 },
    min: { type: Boolean, default: false },
    cap: { type: Boolean, default: false },
    num: { type: Boolean, default: false },
    spec: { type: Boolean, default: false },
    length: { type: Number, default: 12 },
    created_at: { type: Date },
    updated_at: { type: Date }
});

const Psk = mongoose.model('Psk', PskSchema);


// Pre save
PskSchema.pre('save', function(next) {
    const now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Psk;