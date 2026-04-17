const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema({
    finePerDay: { type: Number, default: 10 }
});

module.exports = mongoose.model("Config", ConfigSchema);