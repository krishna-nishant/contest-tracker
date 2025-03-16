const puppeteer = require("puppeteer");

const fetchLeetCodeContests = async () => {
    try {
        const url = "https://leetcode.com/contest/";
        console.log("🔍 Scraping LeetCode contests...");

        const browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
        });

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(60000);

        // Bypass bot detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
        });

        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        // **🚀 Fixed Scrolling: Keep scrolling until no change for 5 iterations**
        let previousHeight = 0;
        let unchangedScrolls = 0;

        while (unchangedScrolls < 5) {  
            let newHeight = await page.evaluate(() => document.body.scrollHeight);

            if (newHeight === previousHeight) {
                unchangedScrolls++;
            } else {
                unchangedScrolls = 0;  // Reset counter if new content is found
            }

            await page.evaluate(() => window.scrollBy(0, 1000));
            await new Promise((resolve) => setTimeout(resolve, 1500));  // Delay for loading
            previousHeight = newHeight;
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Extra wait

        // **Extract contests safely**
        let contests = await page.evaluate(() => {
            const contestList = [];

            // **Upcoming Contests**
            document.querySelectorAll(".group a[href^='/contest/']").forEach((element) => {
                const titleElement = element.querySelector(".truncate span");
                const title = titleElement ? titleElement.innerText.trim() : null;

                const startsInElement = element.closest(".group")?.querySelector(".lc-md\\:h-16");
                const startsInText = startsInElement ? startsInElement.innerText.trim() : null;

                const contestLink = element.getAttribute("href");
                const contestUrl = contestLink ? `https://leetcode.com${contestLink}` : "https://leetcode.com/contest/";

                if (title && startsInText) {
                    contestList.push({
                        title,
                        platform: "LeetCode",
                        start_time: null, // Placeholder, will calculate later
                        duration: 90,
                        url: contestUrl,
                        past: false,
                        starts_in: startsInText,
                    });
                }
            });

            // **Past Contests**
            document.querySelectorAll("a[href^='/contest/']").forEach((element) => {
                const titleElement = element.querySelector(".truncate span");
                const title = titleElement ? titleElement.innerText.trim() : null;

                const startTimeElement = element.closest(".group")?.querySelector("[class*='text-label-3']");
                const startTimeText = startTimeElement ? startTimeElement.innerText.trim() : null;

                const contestLink = element.getAttribute("href");
                const contestUrl = contestLink ? `https://leetcode.com${contestLink}` : "https://leetcode.com/contest/";

                if (title && startTimeText) {
                    contestList.push({
                        title,
                        platform: "LeetCode",
                        start_time: startTimeText, // Will be converted later
                        duration: 90,
                        url: contestUrl,
                        past: true,
                    });
                }
            });

            return contestList;
        });

        await browser.close();

        // **Convert "Starts in" to real Date for upcoming contests**
        contests = contests.map(contest => {
            if (!contest.past) {
                const match = contest.starts_in.match(/(\d+)h (\d+)m (\d+)s/);
                if (match) {
                    let [, hours, minutes, seconds] = match.map(Number);
                    let startDate = new Date();
                    startDate.setHours(startDate.getHours() + hours);
                    startDate.setMinutes(startDate.getMinutes() + minutes);
                    startDate.setSeconds(startDate.getSeconds() + seconds);
                    contest.start_time = startDate;
                }
            } else {
                if (contest.start_time.toLowerCase() === "ended") {
                    console.warn(`⚠️ Skipping invalid contest date for ${contest.title}`);
                    return null; // Ignore contests with 'Ended' as start time
                }
                contest.start_time = convertLeetCodeDate(contest.start_time);
            }
            return contest;
        }).filter(Boolean);  // Remove null entries

        // **Ensure 10+ Past Contests**
        const pastContests = contests.filter(contest => contest.past).slice(-10);
        const upcomingContests = contests.filter(contest => !contest.past);

        console.log("✅ LeetCode Contests Fetched:", [...upcomingContests, ...pastContests]);
        return [...upcomingContests, ...pastContests];
    } catch (error) {
        console.error("❌ Error scraping LeetCode:", error.message);
        return [];
    }
};

// **Convert LeetCode's past contest date format to JavaScript Date**
const convertLeetCodeDate = (dateString) => {
    try {
        const months = {
            "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04",
            "May": "05", "Jun": "06", "Jul": "07", "Aug": "08",
            "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
        };

        const match = dateString.match(/([A-Za-z]+) (\d+), (\d+) (\d+):(\d+) (AM|PM) GMT\+(\d+:\d+)/);
        if (!match) return null;

        let [, month, day, year, hour, minute, meridian] = match;
        month = months[month];

        if (meridian === "PM" && hour !== "12") hour = String(parseInt(hour) + 12);
        if (meridian === "AM" && hour === "12") hour = "00";

        return new Date(`${year}-${month}-${day}T${hour}:${minute}:00.000Z`);
    } catch (error) {
        console.error("❌ Error converting LeetCode date:", dateString);
        return null;
    }
};

module.exports = fetchLeetCodeContests;
