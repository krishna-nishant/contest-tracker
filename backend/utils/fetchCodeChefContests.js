const axios = require("axios");

const fetchCodeChefContests = async () => {
    try {
        console.log("🔍 Fetching CodeChef contests...");

        const url = "https://www.codechef.com/api/list/contests/all";
        const response = await axios.get(url);

        console.log("🔍 CodeChef API Response:", response.data.past_contests.slice(0, 5)); // Debugging

        const upcoming = response.data.future_contests.map(contest => ({
            title: contest.contest_name,
            platform: "CodeChef",
            start_time: new Date(contest.contest_start_date_iso),
            duration: contest.contest_duration / 60,
            url: `https://www.codechef.com/${contest.contest_code}`,
            past: false,
        }));

        const past = response.data.past_contests
            .slice(0, 20) // 🔹 Get only the last 20 past contests
            .map(contest => ({
                title: contest.contest_name,
                platform: "CodeChef",
                start_time: new Date(contest.contest_start_date_iso),
                duration: contest.contest_duration / 60,
                url: `https://www.codechef.com/${contest.contest_code}`,
                past: true,
            }));

        const allContests = [...upcoming, ...past];

        console.log("✅ CodeChef Contests:", allContests);
        return allContests;
    } catch (error) {
        console.error("❌ Error fetching CodeChef contests:", error.message);
        return [];
    }
};

module.exports = fetchCodeChefContests;
