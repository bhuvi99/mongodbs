const mongoose = require( "mongoose");
const Schema = mongoose.Schema;

const mongodb_ips = new Schema({

    ip:{
        type: String
    },
    date : {
        type: Number
    }
});

module.exports = mongoose.model("mongodb_ips", mongodb_ips);