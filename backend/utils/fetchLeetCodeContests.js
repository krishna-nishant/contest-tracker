const axios = require("axios");

const fetchLeetCodeContests = async () => {
    try {
        console.log("🔍 Fetching LeetCode contests via GraphQL...");

        const graphqlQuery = {
            query: `
                query getContestList {
                    allContests {
                        title
                        startTime
                        duration
                        titleSlug
                    }
                }
            `
        };

        const response = await axios.post("https://leetcode.com/graphql", graphqlQuery, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        const allContests = response.data.data.allContests;
        const now = Date.now();

        const contests = allContests.map(contest => ({
            title: contest.title,
            platform: "LeetCode",
            start_time: new Date(contest.startTime * 1000), // Convert UNIX timestamp to UTC
            duration: contest.duration / 60, // Convert seconds to minutes
            url: `https://leetcode.com/contest/${contest.titleSlug}`,
            past: contest.startTime * 1000 < now // Mark past contests correctly
        }));

        // Sort past contests in descending order (latest first)
        const pastContests = contests
            .filter(contest => contest.past)
            .sort((a, b) => b.start_time - a.start_time) // Sort by newest first
            .slice(0, 20); // Get the last 10 past contests

        const upcomingContests = contests.filter(contest => !contest.past);

        console.log("✅ LeetCode Contests Fetched:", [...upcomingContests, ...pastContests]);
        return [...upcomingContests, ...pastContests];
    } catch (error) {
        console.error("❌ Error fetching LeetCode contests:", error.message);
        return [];
    }
};

module.exports = fetchLeetCodeContests;
