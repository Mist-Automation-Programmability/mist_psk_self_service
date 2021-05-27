const mongoose = require('mongoose');

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
    auth_method: { type: String }
});


const Account = mongoose.model('Account', AccountSchema);


module.exports = Account;