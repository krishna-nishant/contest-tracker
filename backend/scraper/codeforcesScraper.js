const axios = require("axios");

const scrapeCodeforcesContests = async () => {
    try {
        const response = await axios.get("https://codeforces.com/api/contest.list");
        const contests = response.data.result.map(contest => ({
            title: contest.name,
            platform: "Codeforces",
            start_time: new Date(contest.startTimeSeconds * 1000),
            duration: contest.durationSeconds / 60,
            url: `https://codeforces.com/contest/${contest.id}`,
            past: contest.phase === "FINISHED", // Mark as past if contest is finished
        }));

        // Keep only the last 3 past contests
        const pastContests = contests.filter(contest => contest.past).slice(0, 3);
        const upcomingContests = contests.filter(contest => !contest.past);

        console.log("✅ Codeforces Contests Fetched:", [...upcomingContests, ...pastContests]);
        return [...upcomingContests, ...pastContests];
    } catch (error) {
        console.error("❌ Error fetching Codeforces contests:", error.message);
        return [];
    }
};

module.exports = scrapeCodeforcesContests;
