const axios = require("axios");

const normalizeDuration = (duration) => (isNaN(duration) ? 90 : Number(duration));

const fetchCodeforcesContests = async () => {
    try {
        console.log("🔍 Fetching Codeforces contests...");
        const url = "https://codeforces.com/api/contest.list";
        const response = await axios.get(url);

        const contests = response.data.result
            .filter(contest => contest.phase === "FINISHED") // Get past contests
            .slice(0, 10) // Fetch 10 past contests
            .map(contest => ({
                title: contest.name,
                platform: "Codeforces",
                start_time: new Date(contest.startTimeSeconds * 1000),
                duration: normalizeDuration(contest.durationSeconds / 60),
                url: `https://codeforces.com/contest/${contest.id}`,
                past: true,
            }));

        console.log(`✅ Fetched ${contests.length} Codeforces contests`);
        return contests;
    } catch (error) {
        console.error("❌ Error fetching Codeforces contests:", error.message);
        return [];
    }
};

module.exports = fetchCodeforcesContests;
