const mongoose = require('mongoose');
const I18n = require('./i18n');

const CustomizationSchema = new mongoose.Schema({
    logo: {
        url: { type: String }
    },
    colors: {
        background: { type: String },
        card: { type: String },
        primary: { type: String },
        accent: { type: String },
    },
    i18n_default: { type: String },
    i18n: {
        _en: { type: mongoose.Schema.ObjectId, ref: "I18n" },
        _fi: { type: mongoose.Schema.ObjectId, ref: "I18n" },
        _fr: { type: mongoose.Schema.ObjectId, ref: "I18n" },
        _de: { type: mongoose.Schema.ObjectId, ref: "I18n" },
        _it: { type: mongoose.Schema.ObjectId, ref: "I18n" },
        _pt: { type: mongoose.Schema.ObjectId, ref: "I18n" },
        _es: { type: mongoose.Schema.ObjectId, ref: "I18n" },
        _se: { type: mongoose.Schema.ObjectId, ref: "I18n" },
    },
    created_at: { type: Date },
    updated_at: { type: Date }
});

const Customization = mongoose.model('Customization', CustomizationSchema);


// Pre save
CustomizationSchema.pre('save', function(next) {
    const now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = Customization;