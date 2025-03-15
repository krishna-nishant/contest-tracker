const puppeteer = require("puppeteer");

const scrapeCodeChefContests = async () => {
    let browser;
    try {
        const url = "https://www.codechef.com/contests";

        browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            headless: false, // Set to true for headless mode
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
        });

        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout(60000); // Increase timeout

        // Disable webdriver detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, "webdriver", { get: () => false });
        });

        console.log("🔄 Navigating to CodeChef contests page...");
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        // Wait for the upcoming contests section to load
        console.log("✅ Waiting for upcoming contests section to load...");
        await page.waitForSelector('div._table__container_7s2sw_344:has(p._title_7s2sw_347)', { timeout: 60000 });

        // Add a delay to ensure contests are fully loaded (using setTimeout)
        console.log("✅ Adding delay to ensure contests are loaded...");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

        console.log("✅ Upcoming contests section loaded. Extracting contests...");

        // Log the HTML of the upcoming contests section for debugging
        const upcomingSectionHTML = await page.evaluate(() => {
            const section = document.querySelector('div._table__container_7s2sw_344:has(p._title_7s2sw_347)');
            return section ? section.innerHTML : null;
        });
        console.log("🔍 Upcoming Contests Section HTML:", upcomingSectionHTML?.substring(0, 1000)); // Log first 1000 characters

        // Extract upcoming contests
        const contests = await page.evaluate(() => {
            const contestList = [];

            // Find all contest elements
            const contestElements = document.querySelectorAll('div._flex__container_7s2sw_528');
            contestElements.forEach((contestElement) => {
                // Extract contest name and URL
                const nameElement = contestElement.querySelector('a');
                const name = nameElement?.querySelector('span')?.innerText.trim();
                const url = nameElement?.href;

                // Extract "starts in" information
                const startsInElement = contestElement.querySelector('div._timer__container_7s2sw_590');
                let startsIn = null;
                if (startsInElement) {
                    const timeParts = Array.from(startsInElement.querySelectorAll('p')).map(p => p.innerText.trim());
                    startsIn = timeParts.join(' ');
                }

                // Add contest to the list
                if (name && url) {
                    contestList.push({
                        name,
                        platform: "CodeChef",
                        url,
                        starts_in: startsIn,
                    });
                }
            });

            return contestList;
        });

        console.log("✅ Upcoming Contests Fetched:", contests.length ? contests : "No upcoming contests found");
        return contests;
    } catch (error) {
        console.error("❌ Error scraping CodeChef:", error.message);
        return [];
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = scrapeCodeChefContests;