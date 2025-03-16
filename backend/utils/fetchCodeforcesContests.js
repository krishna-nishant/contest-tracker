const axios = require("axios");

const fetchCodeforcesContests = async () => {
    try {
        console.log("🔍 Fetching Codeforces contests...");

        const url = "https://codeforces.com/api/contest.list";
        const response = await axios.get(url);

        console.log("🔍 Codeforces API Response:", response.data.result.slice(0, 5)); // Log first 5 results for debugging

        const upcoming = response.data.result
            .filter(contest => contest.phase === "BEFORE") // 🔹 Only upcoming contests
            .map(contest => ({
                title: contest.name,
                platform: "Codeforces",
                start_time: new Date(contest.startTimeSeconds * 1000),
                duration: contest.durationSeconds / 60,
                url: `https://codeforces.com/contest/${contest.id}`,
                past: false,
            }));

        console.log("✅ Codeforces Contests:", upcoming);
        return upcoming;
    } catch (error) {
        console.error("❌ Error fetching Codeforces contests:", error.message);
        return [];
    }
};

module.exports = fetchCodeforcesContests;
