// const mongoose = require("mongoose");

// const ContestSchema = new mongoose.Schema({
//     title: { type: String, unique: true }, // Prevent duplicate contests
//     platform: String,
//     start_time: Date,
//     duration: Number,
//     url: String,
//     past: Boolean,
//     solution_link: String,
//     bookmarked: { type: Boolean, default: false }
// });

// // Add indexes for faster searching
// ContestSchema.index({ platform: 1, start_time: 1 });

// module.exports = mongoose.model("Contest", ContestSchema);


const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    platform: { type: String, required: true },
    start_time: { type: Date },
    duration: { type: Number, required: true }, // in minutes
    url: { type: String, required: true },
    past: { type: Boolean, default: false },
    bookmarked: { type: Boolean, default: false },
    solution_link: { type: String } // Optional: YouTube solution link
});

module.exports = mongoose.model("Contest", contestSchema);
