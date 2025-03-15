const axios = require("axios");

const scrapeCodeforcesContests = async () => {
    try {
        const response = await axios.get("https://codeforces.com/api/contest.list");
        return response.data.result
            .filter(contest => contest.phase === "BEFORE")
            .map(contest => ({
                title: contest.name,
                platform: "Codeforces",
                start_time: new Date(contest.startTimeSeconds * 1000),
                duration: contest.durationSeconds / 60,
                url: `https://codeforces.com/contest/${contest.id}`,
                past: false,
            }));
    } catch (error) {
        console.error("❌ Error fetching Codeforces contests:", error.message);
        return [];
    }
};

module.exports = scrapeCodeforcesContests;
