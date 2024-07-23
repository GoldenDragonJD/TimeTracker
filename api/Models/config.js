const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const configSchema = new Schema({
    MailJet: {
        type: Boolean,
        required: true,
    },
    yourEmail: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

const Config = mongoose.model("Config", configSchema);

module.exports = Config;
