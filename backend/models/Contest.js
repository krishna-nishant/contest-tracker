const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    platform: { type: String, required: true },
    start_time: { type: Date },
    duration: { type: Number, required: true },
    url: { type: String, required: true },
    past: { type: Boolean, default: false },
    solution_link: { type: String }
});

module.exports = mongoose.model("Contest", contestSchema);