const axios = require("axios");

const normalizeDuration = (duration) => (isNaN(duration) ? 90 : Number(duration));

const fetchCodeChefContests = async () => {
    try {
        console.log("🔍 Fetching CodeChef contests...");
        const url = "https://www.codechef.com/api/list/contests/all";
        const response = await axios.get(url);

        const contests = response.data.past_contests.slice(0, 10).map((contest) => ({
            title: contest.contest_name,
            platform: "CodeChef",
            start_time: new Date(contest.contest_start_date_iso),
            duration: normalizeDuration(contest.contest_duration / 60),
            url: `https://www.codechef.com/${contest.contest_code}`,
            past: true,
        }));

        console.log(`✅ Fetched ${contests.length} CodeChef contests`);
        return contests;
    } catch (error) {
        console.error("❌ Error fetching CodeChef contests:", error.message);
        return [];
    }
};

module.exports = fetchCodeChefContests;
