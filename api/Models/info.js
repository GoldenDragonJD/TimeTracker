const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const infoSchema = new Schema({
    storeName: {
        type: String,
        required: true,
    },
    storeLocation: {
        type: String,
        required: false,
    },
    lastVisit: {
        type: Date,
        required: false,
    },
    nextVisit: {
        type: Date,
        required: false,
    },
});

const Info = mongoose.model("Info", infoSchema)

module.exports = Info;
