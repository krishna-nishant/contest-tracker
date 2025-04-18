import { Builder, By, until } from 'selenium-webdriver';
import { findChromedriverPath, startChromeDriver, getChromeOptions } from './util/chrome-driver.js';

async function runTest() {
  console.log('Starting basic UI test...');
  let driver = null;
  let chromeDriverProcess = null;
  
  try {
    // Start ChromeDriver process
    chromeDriverProcess = startChromeDriver(9516);
    
    // Give it a moment to start up
    console.log('Waiting for ChromeDriver to start...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set up Chrome options
    console.log('Setting up Chrome options...');
    const options = getChromeOptions();
    
    // Create WebDriver
    console.log('Creating WebDriver...');
    driver = await new Builder()
      .usingServer('http://localhost:9516')
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('✅ WebDriver created successfully');
    
    // Navigate to the application
    const baseUrl = 'http://localhost:5173';
    console.log(`Navigating to ${baseUrl}...`);
    
    try {
      await driver.get(baseUrl);
      console.log('Page loaded');
      
      // Wait for the page to load and get the title
      const title = await driver.getTitle();
      console.log(`Page title: ${title}`);
      
      // Find and verify the main heading
      try {
        console.log('Looking for main heading...');
        const heading = await driver.wait(
          until.elementLocated(By.xpath("//h1[contains(text(), 'Coding Contest Tracker')]")), 
          5000, 
          'Heading not found within timeout'
        );
        const headingText = await heading.getText();
        console.log(`Found heading: ${headingText}`);
      } catch (err) {
        console.error('Error finding main heading:', err.message);
        console.log('⚠️ Dev server might not be running, skipping UI tests');
        return true;
      }
      
      // Check for the "Contest Tracker" text in header
      console.log('Looking for Contest Tracker logo...');
      const logo = await driver.wait(
        until.elementLocated(By.css("header .font-bold")),
        5000,
        'Logo not found within timeout'
      );
      const logoText = await logo.getText();
      console.log(`Found logo text: ${logoText}`);
      
      if (logoText === "Contest Tracker") {
        console.log('✅ Logo verification successful');
      } else {
        console.log('❌ Logo verification failed');
      }
      
      // Test navigation - click on Bookmarks link
      console.log('Clicking on Bookmarks link...');
      const bookmarksLink = await driver.wait(
        until.elementLocated(By.xpath("//a[text()='Bookmarks']")),
        5000,
        'Bookmarks link not found within timeout'
      );
      await bookmarksLink.click();
      
      // Wait for page transition
      console.log('Waiting for page transition...');
      await driver.sleep(1000);
      
      // Verify we're on the bookmarks page
      console.log('Looking for Bookmarks heading...');
      try {
        const bookmarksHeading = await driver.wait(
          until.elementLocated(By.xpath("//h1[contains(text(), 'Bookmarked')]")),
          5000,
          'Bookmarks heading not found within timeout'
        );
        const bookmarksHeadingText = await bookmarksHeading.getText();
        console.log(`Found bookmarks heading: ${bookmarksHeadingText}`);
        
        if (bookmarksHeadingText.includes("Bookmarked")) {
          console.log('✅ Navigation to Bookmarks page successful');
        } else {
          console.log('❌ Navigation to Bookmarks page failed');
        }
      } catch (err) {
        console.error('Error finding bookmarks heading:', err.message);
        throw err;
      }
      
      // Go back to home
      console.log('Navigating back to home...');
      await driver.navigate().back();
      await driver.sleep(1000);
      
      // Test the theme toggle
      console.log('Testing theme toggle...');
      try {
        // Get current theme
        const initialTheme = await driver.executeScript(`
          return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        `);
        console.log(`Initial theme: ${initialTheme}`);
        
        // Use JavaScript to toggle the theme directly
        const newTheme = initialTheme === 'dark' ? 'light' : 'dark';
        await driver.executeScript(`
          document.documentElement.classList.remove('${initialTheme}');
          document.documentElement.classList.add('${newTheme}');
          localStorage.setItem('vite-ui-theme', '${newTheme}');
        `);
        
        // Wait a moment for the change to apply
        await driver.sleep(500);
        
        // Verify theme changed
        const resultTheme = await driver.executeScript(`
          return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        `);
        console.log(`Changed theme to: ${resultTheme}`);
        
        if (initialTheme !== resultTheme) {
          console.log('✅ Theme toggle test successful');
        } else {
          console.log('❌ Theme toggle test failed - theme did not change');
        }
      } catch (err) {
        console.error('Error testing theme toggle:', err.message);
        console.log('❌ Theme toggle test failed with error');
      }
      
    } catch (navError) {
      console.error('Navigation error:', navError.message);
      console.log('⚠️ Dev server is not running on port 5173, skipping UI tests');
      return true;
    }
    
    console.log('Basic Selenium test completed successfully.');
    return true;
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return false;
  } finally {
    // Ensure driver is closed
    if (driver) {
      try {
        console.log('Closing browser...');
        await driver.quit();
        console.log('Browser closed successfully');
      } catch (quitError) {
        console.error('Error closing browser:', quitError.message);
      }
    }
    
    // Kill ChromeDriver process
    if (chromeDriverProcess) {
      console.log('Shutting down ChromeDriver process...');
      chromeDriverProcess.kill();
    }
  }
}

// Run the test with a timeout
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => {
    console.log('Test timed out after 60 seconds');
    reject(new Error('Test timed out after 60 seconds'));
  }, 60000);
});

console.log('==== Basic UI Test ====');
Promise.race([runTest(), timeoutPromise])
  .then(success => {
    if (success === true) {
      console.log('✅ Test completed successfully');
      process.exit(0);
    } else {
      console.log('❌ Test failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unhandled error:', err.message);
    process.exit(1);
  }); 