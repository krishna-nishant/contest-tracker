// const express = require("express");
// const Contest = require("../models/Contest");
// const fetchContests = require("../scraper/fetchContests");

// const router = express.Router();

// // Fetch and store contests
// router.get("/fetch", async (req, res) => {
//     try {
//         const contests = await fetchContests();

//         for (let contest of contests) {
//             await Contest.findOneAndUpdate(
//                 { title: contest.title, platform: contest.platform },
//                 { $set: contest },
//                 { upsert: true, new: true }
//             );
//         }

//         res.json({ message: "Contests fetched and stored successfully!" });
//     } catch (error) {
//         console.error("❌ Error fetching contests:", error.message);
//         res.status(500).json({ error: "Failed to fetch contests" });
//     }
// });

// // Get all contests with filtering
// router.get("/", async (req, res) => {
//     try {
//         const { platform, past } = req.query;
//         const filter = {};

//         if (platform) filter.platform = platform;
//         if (past !== undefined) filter.past = past === "true";

//         const contests = await Contest.find(filter).sort({ start_time: 1 });
//         res.json(contests);
//     } catch (error) {
//         console.error("❌ Error fetching contests from DB:", error.message);
//         res.status(500).json({ error: "Failed to fetch contests" });
//     }
// });

// // Bookmark a contest
// router.post("/bookmark/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const contest = await Contest.findById(id);

//         if (!contest) {
//             return res.status(404).json({ error: "Contest not found" });
//         }

//         contest.bookmarked = !contest.bookmarked; // Toggle
//         await contest.save();

//         res.json({ message: "Bookmark updated", bookmarked: contest.bookmarked });
//     } catch (error) {
//         console.error("❌ Error bookmarking contest:", error.message);
//         res.status(500).json({ error: "Failed to bookmark contest" });
//     }
// });

// router.post("/solution/:id", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { solution_link } = req.body;

//         if (!solution_link || !solution_link.startsWith("https://")) {
//             return res.status(400).json({ error: "Invalid YouTube link" });
//         }

//         const contest = await Contest.findById(id);
//         if (!contest) {
//             return res.status(404).json({ error: "Contest not found" });
//         }

//         contest.solution_link = solution_link;
//         await contest.save();

//         res.json({ message: "Solution link updated successfully!", solution_link });
//     } catch (error) {
//         console.error("❌ Error updating solution link:", error.message);
//         res.status(500).json({ error: "Failed to update solution link" });
//     }
// });

// module.exports = router;



const express = require("express");
const Contest = require("../models/Contest");
const fetchContests = require("../scraper/fetchContests");

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

        const contests = await Contest.find(filter).sort({ start_time: 1 });
        res.json(contests);
    } catch (error) {
        console.error("❌ Error fetching contests:", error.message);
        res.status(500).json({ error: "Failed to retrieve contests" });
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
