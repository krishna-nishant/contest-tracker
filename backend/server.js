require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const contestRoutes = require("./routes/contestRoutes");
// const fetchSolutions = require("./utils/youtubeScraper");

// setInterval(fetchSolutions, 6 * 60 * 60 * 1000); // Run every 6 hours
// fetchSolutions(); // Run once when the server starts
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/contests", contestRoutes);

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
