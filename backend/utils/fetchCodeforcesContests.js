const axios = require("axios");

const fetchCodeforcesContests = async () => {
    try {
        console.log("🔍 Fetching Codeforces contests...");

        const url = "https://codeforces.com/api/contest.list";
        const response = await axios.get(url);

        console.log("🔍 Codeforces API Response:", response.data.result.slice(0, 5)); // Debugging

        const upcoming = response.data.result
            .filter(contest => contest.phase === "BEFORE")
            .map(contest => ({
                title: contest.name,
                platform: "Codeforces",
                start_time: new Date(contest.startTimeSeconds * 1000),
                duration: contest.durationSeconds / 60,
                url: `https://codeforces.com/contest/${contest.id}`,
                past: false,
            }));

        const past = response.data.result
            .filter(contest => contest.phase === "FINISHED")
            .slice(0, 20) // 🔹 Get only the last 20 past contests
            .map(contest => ({
                title: contest.name,
                platform: "Codeforces",
                start_time: new Date(contest.startTimeSeconds * 1000),
                duration: contest.durationSeconds / 60,
                url: `https://codeforces.com/contest/${contest.id}`,
                past: true,
            }));

        const allContests = [...upcoming, ...past];

        console.log("✅ Codeforces Contests:", allContests);
        return allContests;
    } catch (error) {
        console.error("❌ Error fetching Codeforces contests:", error.message);
        return [];
    }
};

module.exports = fetchCodeforcesContests;
