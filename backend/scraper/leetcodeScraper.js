const puppeteer = require("puppeteer");

// Function to scrape LeetCode contests
const scrapeLeetCodeContests = async () => {
    try {
        const url = "https://leetcode.com/contest/";

        const browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            headless: false,
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
        });

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(30000);

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
        });

        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

        // Scroll to load all contests
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if (totalHeight >= document.body.scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 200);
            });
        });

        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait extra time

        // Extract contests safely
        let contests = await page.evaluate(() => {
            const contestList = [];

            // Extract Upcoming Contests
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

            // Extract Past Contests
            document.querySelectorAll("[class*='text-label-3']").forEach((timeElement) => {
                const contestDiv = timeElement.closest(".group");
                if (!contestDiv) return;

                const titleElement = contestDiv.querySelector(".truncate span");
                const title = titleElement ? titleElement.innerText.trim() : null;

                const startTimeText = timeElement ? timeElement.innerText.trim() : null;

                const contestLink = contestDiv.querySelector("a[href^='/contest/']")?.getAttribute("href");
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

        // Convert "Starts in" to a real Date for upcoming contests
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
                contest.start_time = convertLeetCodeDate(contest.start_time);
            }
            return contest;
        });

        // Keep only the last 3 past contests
        const pastContests = contests.filter(contest => contest.past).slice(-3);
        const upcomingContests = contests.filter(contest => !contest.past);

        console.log("✅ LeetCode Contests Fetched:", [...upcomingContests, ...pastContests]);
        return [...upcomingContests, ...pastContests];
    } catch (error) {
        console.error("❌ Error scraping LeetCode:", error.message);
        return [];
    }
};

// Function to convert LeetCode's past contest date format to JavaScript Date
const convertLeetCodeDate = (dateString) => {
    try {
        // Example: "Mar 9, 2025 8:00 AM GMT+5:30"
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

module.exports = scrapeLeetCodeContests;
