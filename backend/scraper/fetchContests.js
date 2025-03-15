const scrapeLeetCodeContests = require("./leetcodeScraper");
const scrapeCodeforcesContests = require("./codeforcesScraper");
const scrapeCodeChefContests = require("./codechefScraper");

const fetchContests = async () => {
    try {
        const leetcodeContests = await scrapeLeetCodeContests();
        const codeforcesContests = await scrapeCodeforcesContests();
        const codechefContests = await scrapeCodeChefContests();

        return [...leetcodeContests, ...codeforcesContests, ...codechefContests];
    } catch (error) {
        console.error("❌ Error fetching contests:", error.message);
        return [];
    }
};

module.exports = fetchContests;
