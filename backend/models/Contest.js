const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema({
    title: String,
    platform: String, // "LeetCode", "Codeforces", "CodeChef"
    start_time: Date,
    duration: Number, // In minutes
    url: String,
    past: Boolean, // true if the contest has ended
    solution_link: String, // YouTube link (if available)
});

module.exports = mongoose.model("Contest", ContestSchema);
