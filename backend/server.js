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

/**
 * Schedule data fetching at 10 PM daily
 */
const setupDailyFetchSchedule = () => {
  // Calculate time until 10 PM today or tomorrow
  const calculateTimeUntil10PM = () => {
    const now = new Date();
    const target = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      22, 0, 0 // 10 PM
    );

    // If it's already past 10 PM, schedule for tomorrow
    if (now >= target) {
      target.setDate(target.getDate() + 1);
    }

    return target.getTime() - now.getTime();
  };

  // Run the daily fetch job
  const runDailyFetchJob = () => {
    console.log("⏰ Running scheduled 10 PM data fetch");
    fetchAndStoreContests();
    fetchSolutions();
  };

  // Set up the initial timer
  const msUntil10PM = calculateTimeUntil10PM();
  const minutesUntil10PM = Math.round(msUntil10PM / 1000 / 60);

  console.log(`📅 Scheduling next contest fetch in ${minutesUntil10PM} minutes (at 10 PM)`);

  // Schedule first run
  const initialTimer = setTimeout(() => {
    runDailyFetchJob();

    // Then set up a 24-hour interval
    setInterval(runDailyFetchJob, 24 * 60 * 60 * 1000);
  }, msUntil10PM);

  return initialTimer;
};

/**
 * Check if we need to fetch data on startup
 */
const initialDataFetch = async () => {
  try {
    const Contest = require("./models/Contest");
    const count = await Contest.countDocuments();

    if (count === 0) {
      console.log("🆕 No contests in database, fetching initial data...");
      await fetchAndStoreContests();
      await fetchSolutions();
    } else {
      console.log(`📊 Database already contains ${count} contests, skipping initial fetch`);
    }
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
  }
};

/**
 * Configure and start the server
 */
const startServer = () => {
  // Set up the daily fetch schedule
  setupDailyFetchSchedule();

  // Check for initial data
  initialDataFetch();

  // Set up middleware
  app.use(express.json());

  // Add a health check endpoint for monitoring services like UptimeRobot
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
  });

  // Routes
  app.use("/api/contests", contestRoutes);

  // Start listening
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

// Start the server
startServer();
