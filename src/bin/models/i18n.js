const mongoose = require('mongoose');

const I18nSchema = new mongoose.Schema({
    login: {
        title: { type: String },
        text: { type: String },
        button: { type: String }
    },
    portal: {
        title: { type: String },
        text: { type: String },
        create_button: { type: String },
        email_button: { type: String },
        qrcode_button: { type: String },
        delete_button: { type: String },
        logout_button: { type: String },
        keyCreatedSuccesfully: { type: String },
        keyDeletededSuccesfully: { type: String },
        keySentSuccesfully: { type: String },
        rows: [{
            index: { type: String },
            icon: { type: String },
            text: { type: String }
        }],

    },
    created_at: { type: Date },
    updated_at: { type: Date }
});

const I18n = mongoose.model('I18n', I18nSchema);


// Pre save
I18nSchema.pre('save', function(next) {
    const now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

module.exports = I18n;