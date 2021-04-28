var mongoose = require('mongoose');

var OktaSchema = new mongoose.Schema({
    audience: { type: String, required: true },
    client_id: { type: String, required: true },
    client_secret: { type: String, required: true },
    created_at: { type: Date },
    updated_at: { type: Date }
});

var Okta = mongoose.model('Okta', OktaSchema);


// Pre save
OktaSchema.pre('save', function(next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Okta;