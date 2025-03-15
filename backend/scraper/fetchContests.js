// const scrapeLeetCodeContests = require("./leetcodeScraper");
// const scrapeCodeforcesContests = require("./codeforcesScraper");
// const scrapeCodeChefContests = require("./codechefScraper");

// const fetchContests = async () => {
//     try {
//         const leetcodeContests = await scrapeLeetCodeContests();
//         const codeforcesContests = await scrapeCodeforcesContests();
//         const codechefContests = await scrapeCodeChefContests();

//         return [...leetcodeContests, ...codeforcesContests, ...codechefContests];
//     } catch (error) {
//         console.error("❌ Error fetching contests:", error.message);
//         return [];
//     }
// };

// module.exports = fetchContests;


const axios = require("axios");
const Contest = require("../models/Contest");

const normalizeDuration = (duration) => {
    if (!duration || isNaN(duration)) return 90; // Default to 90 minutes if missing
    return Number(duration);
};

const fetchLeetCodeContests = async () => {
    try {
        const url = "https://leetcode.com/graphql?operationName=upcomingContests&query=query%20upcomingContests%20{%20upcomingContests{%20title%20titleSlug%20startTime%20duration%20__typename%20}}";
        const response = await axios.get(url);
        return response.data.data.upcomingContests.map((contest) => ({
            title: contest.title,
            platform: "LeetCode",
            start_time: new Date(contest.startTime * 1000), // Convert UNIX timestamp
            duration: normalizeDuration(contest.duration),
            url: `https://leetcode.com/contest/${contest.titleSlug}`,
            past: false,
        }));
    } catch (error) {
        console.error("❌ Error fetching LeetCode contests:", error.message);
        return [];
    }
};

const fetchCodeforcesContests = async () => {
    try {
        const url = "https://codeforces.com/api/contest.list";
        const response = await axios.get(url);
        return response.data.result
            .filter(contest => contest.phase === "BEFORE")
            .map(contest => ({
                title: contest.name,
                platform: "Codeforces",
                start_time: new Date(contest.startTimeSeconds * 1000),
                duration: normalizeDuration(contest.durationSeconds / 60),
                url: `https://codeforces.com/contest/${contest.id}`,
                past: false,
            }));
    } catch (error) {
        console.error("❌ Error fetching Codeforces contests:", error.message);
        return [];
    }
};

const fetchCodeChefContests = async () => {
    try {
        const url = "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all";
        const response = await axios.get(url);
        return response.data.future_contests.map((contest) => ({
            title: contest.contest_name,
            platform: "CodeChef",
            start_time: new Date(contest.contest_start_date_iso),
            duration: normalizeDuration(contest.contest_duration / 60),
            url: `https://www.codechef.com/${contest.contest_code}`,
            past: false,
        }));
    } catch (error) {
        console.error("❌ Error fetching CodeChef contests:", error.message);
        return [];
    }
};

const fetchContests = async () => {
    try {
        const leetCodeContests = await fetchLeetCodeContests();
        const codeforcesContests = await fetchCodeforcesContests();
        const codechefContests = await fetchCodeChefContests();
        return [...leetCodeContests, ...codeforcesContests, ...codechefContests];
    } catch (error) {
        console.error("❌ Error fetching contests:", error.message);
        return [];
    }
};

module.exports = fetchContests;
