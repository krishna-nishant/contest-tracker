require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const contestRoutes = require("./routes/contestRoutes");
const fetchSolutions = require("./utils/youtubeScraper");
const connectDB = require("./config/db");

setInterval(fetchSolutions, 6 * 60 * 60 * 1000); // Run every 6 hours
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/contests", contestRoutes);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
