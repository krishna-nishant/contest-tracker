const puppeteer = require("puppeteer");

const scrapeCodeChefContests = async () => {
    try {
        const url = "https://www.codechef.com/contests";

        const browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

        const contests = await page.evaluate(() => {
            const contestList = [];
            document.querySelectorAll(".dataTable tbody tr").forEach(row => {
                const columns = row.querySelectorAll("td");
                if (columns.length > 0) {
                    contestList.push({
                        title: columns[1].innerText.trim(),
                        platform: "CodeChef",
                        start_time: new Date(columns[2].innerText.trim()),
                        duration: 180,
                        url: `https://www.codechef.com/${columns[0].innerText.trim()}`,
                        past: false,
                    });
                }
            });
            return contestList;
        });

        await browser.close();
        return contests;
    } catch (error) {
        console.error("❌ Error scraping CodeChef:", error.message);
        return [];
    }
};

module.exports = scrapeCodeChefContests;
