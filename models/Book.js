const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
    title: String,
    author: String,
    serialNo: String,
    available: { type: Boolean, default: true },
    issueDate: Date,
    returnDate: Date
});

module.exports = mongoose.model("Book", BookSchema);