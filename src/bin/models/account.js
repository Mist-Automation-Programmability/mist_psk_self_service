const mongoose = require('mongoose');
const Token = require('./token');
const Azure = require('./azure');
const Adfs = require('./adfs');
const Google = require('./google');
const Config = require('./psk');
const Customization = require('./customization');

const AccountSchema = new mongoose.Schema({
    host: { type: String, required: true },
    org_id: { type: String, required: true },
    _token: { type: mongoose.Schema.ObjectId, ref: "Token" },
    _psk: { type: mongoose.Schema.ObjectId, ref: "Psk" },
    _customization: { type: mongoose.Schema.ObjectId, ref: "Customization" },
    _azure: { type: mongoose.Schema.ObjectId, ref: "Azure" },
    _adfs: { type: mongoose.Schema.ObjectId, ref: "Adfs" },
    _google: { type: mongoose.Schema.ObjectId, ref: "Google" },
    _okta: { type: mongoose.Schema.ObjectId, ref: "Okta" },
    auth_method: { type: String },
    created_at: { type: Date },
    updated_at: { type: Date }
});

const Account = mongoose.model('Account', AccountSchema);


// Pre save
AccountSchema.pre('save', function(next) {
    const now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Account;