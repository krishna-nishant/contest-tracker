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
        // Get current date in user's local timezone
        const now = new Date();
        
        // Create start and end times for the current day with a wider range
        // to ensure we capture contests on the same day
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        
        console.log(`Looking for contests between ${todayStart.toISOString()} and ${todayEnd.toISOString()}`);
        console.log(`Current server time: ${now.toISOString()}`);

        const todaysContests = await Contest.find({
            start_time: { $gte: todayStart, $lte: todayEnd }
        }).sort({ start_time: 1 });

        // Log each contest we found for debugging
        console.log(`Found ${todaysContests.length} contests for today (${now.toDateString()})`);
        if (todaysContests.length > 0) {
            todaysContests.forEach(contest => {
                console.log(`- ${contest.title} (${contest.platform}) at ${new Date(contest.start_time).toISOString()}`);
            });
        }
        
        // If we didn't find any contests today, try finding contests in a wider range
        if (todaysContests.length === 0) {
            // Get all contests
            const allContests = await Contest.find({});
            console.log(`Total contests in database: ${allContests.length}`);
            
            // Find the closest upcoming contest
            const upcoming = await Contest.find({
                start_time: { $gte: now }
            }).sort({ start_time: 1 }).limit(1);
            
            if (upcoming.length > 0) {
                console.log(`Next upcoming contest: ${upcoming[0].title} on ${new Date(upcoming[0].start_time).toISOString()}`);
            }
        }
        
        res.json(todaysContests);
    } catch (error) {
        console.error("❌ Error fetching today's contests:", error.message);
        res.status(500).json({ error: "Failed to retrieve today's contests" });
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
