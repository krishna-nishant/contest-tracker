const express = require("express");
const Contest = require("../models/Contest");
const fetchContests = require("../utils/fetchContests");

const router = express.Router();

// ✅ Fetch & Store Contests in MongoDB
router.get("/fetch", async (req, res) => {
    try {
        const contests = await fetchContests();
        for (let contest of contests) {
            await Contest.findOneAndUpdate(
                { title: contest.title, platform: contest.platform },
                { $set: contest },
                { upsert: true, new: true }
            );
        }
        res.json({ message: "Contests fetched and stored successfully!" });
    } catch (error) {
        console.error("❌ Error storing contests:", error.message);
        res.status(500).json({ error: "Failed to fetch and store contests" });
    }
});

// ✅ Get Contests with Filtering
router.get("/", async (req, res) => {
    try {
        const { platform, past } = req.query;
        const filter = {};
        if (platform) filter.platform = platform;
        if (past !== undefined) filter.past = past === "true";

        const sortOrder = past === "true" ? -1 : 1; // 🔹 Descending for past, Ascending for upcoming

        const contests = await Contest.find(filter).sort({ start_time: sortOrder });
        res.json(contests);
    } catch (error) {
        console.error("❌ Error fetching contests:", error.message);
        res.status(500).json({ error: "Failed to retrieve contests" });
    }
});

router.get("/today", async (req, res) => {
    try {
        const now = new Date();
        const todayStartUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
        const todayEndUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

        const todaysContests = await Contest.find({
            start_time: { $gte: todayStartUTC, $lte: todayEndUTC }
        }).sort({ start_time: 1 });

        res.json(todaysContests);
    } catch (error) {
        console.error("❌ Error fetching today's contests:", error.message);
        res.status(500).json({ error: "Failed to retrieve today's contests" });
    }
});

// ✅ Toggle Bookmark
router.post("/bookmark/:id", async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ error: "Contest not found" });

        contest.bookmarked = !contest.bookmarked;
        await contest.save();
        res.json({ message: "Bookmark updated", bookmarked: contest.bookmarked });
    } catch (error) {
        console.error("❌ Error bookmarking contest:", error.message);
        res.status(500).json({ error: "Failed to bookmark contest" });
    }
});

// ✅ Add Solution Link
router.post("/solution/:id", async (req, res) => {
    try {
        const { solution_link } = req.body;
        if (!solution_link || !solution_link.startsWith("https://")) {
            return res.status(400).json({ error: "Invalid YouTube link" });
        }

        const contest = await Contest.findByIdAndUpdate(req.params.id, { solution_link }, { new: true });
        if (!contest) return res.status(404).json({ error: "Contest not found" });

        res.json({ message: "Solution link updated", solution_link });
    } catch (error) {
        console.error("❌ Error updating solution link:", error.message);
        res.status(500).json({ error: "Failed to update solution link" });
    }
});

module.exports = router;
