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

    }
});

const I18n = mongoose.model('I18n', I18nSchema);


module.exports = I18n;