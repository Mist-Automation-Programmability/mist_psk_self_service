const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    apitoken: { type: String, required: true },
    apitoken_id: { type: String, required: true },
    scope: { type: String, required: true },
    created_by: { type: String, required: true },
    created_at: { type: Date },
    updated_at: { type: Date }
});

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