const mongoose = require('mongoose');

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
    }
});

const Customization = mongoose.model('Customization', CustomizationSchema);


module.exports = Customization;