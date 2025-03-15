require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());
const contestRoutes = require("./routes/contestRoutes");

app.use("/api/contests", contestRoutes);

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Contest Tracker API is running!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
