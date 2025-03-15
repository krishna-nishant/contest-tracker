const { google } = require("googleapis");
const Contest = require("../models/Contest");
require("dotenv").config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const PLAYLISTS = {
    LeetCode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
    Codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
    CodeChef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr"
};

const youtube = google.youtube({
    version: "v3",
    auth: YOUTUBE_API_KEY
});

const fetchSolutions = async () => {
    try {
        console.log("🔄 Fetching YouTube solutions...");

        const contests = await Contest.find({ past: true, solution_link: { $exists: false } });

        if (contests.length === 0) {
            console.log("✅ No contests need a solution link.");
            return;
        }

        for (const contest of contests) {
            console.log(`🎯 Searching solution for: ${contest.title}`);

            const playlistId = PLAYLISTS[contest.platform];
            if (!playlistId) {
                console.log(`⚠️ No playlist found for ${contest.platform}`);
                continue;
            }

            const response = await youtube.playlistItems.list({
                part: "snippet",
                playlistId,
                maxResults: 10
            });

            const videos = response.data.items;

            let matched = false;
            for (const video of videos) {
                const title = video.snippet.title.toLowerCase();
                if (title.includes(contest.title.toLowerCase())) {
                    const solutionLink = `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`;
                    
                    // Update contest with solution link
                    await Contest.findByIdAndUpdate(contest._id, { solution_link: solutionLink }, { new: true });

                    console.log(`✅ Solution added for ${contest.title}: ${solutionLink}`);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                console.log(`❌ No matching video found for ${contest.title}`);
            }
        }

        console.log("✅ YouTube solution fetching completed!");

    } catch (error) {
        console.error("❌ Error fetching YouTube solutions:", error);
    }
};

module.exports = fetchSolutions;
