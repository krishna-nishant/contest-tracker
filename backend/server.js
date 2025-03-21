require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const contestRoutes = require("./routes/contestRoutes");
const fetchSolutions = require("./utils/youtubeScraper");
const fetchContests = require("./utils/fetchContests");
const connectDB = require("./config/db");
const app = express();
connectDB();
app.use(cors());

// Function to fetch contests and store them in the database
const fetchAndStoreContests = async () => {
  try {
    console.log("🔄 Auto-fetching contests...");
    const Contest = require("./models/Contest");
    const contests = await fetchContests();
    for (let contest of contests) {
        await Contest.findOneAndUpdate(
            { title: contest.title, platform: contest.platform },
            { $set: contest },
            { upsert: true, new: true }
        );
    }
    console.log(`✅ Successfully stored ${contests.length} contests in database`);
  } catch (error) {
    console.error("❌ Error auto-fetching contests:", error.message);
  }
};

// Automatically fetch contests every 6 hours
setInterval(fetchAndStoreContests, 6 * 60 * 60 * 1000);

// Automatically fetch YouTube solutions every 6 hours
setInterval(fetchSolutions, 6 * 60 * 60 * 1000);

// Run both immediately on startup
fetchAndStoreContests();
fetchSolutions();

app.use(express.json());
app.use("/api/contests", contestRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
