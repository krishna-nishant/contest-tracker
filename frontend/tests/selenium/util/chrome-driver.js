import crossSpawn from 'cross-spawn';
import fs from 'fs';
import path from 'path';
import chrome from 'selenium-webdriver/chrome.js';

// Find chromedriver path
export const findChromedriverPath = () => {
  const nodeModulesBin = path.join(process.cwd(), 'node_modules', '.bin');
  const chromeDriverCmd = path.join(nodeModulesBin, 'chromedriver.cmd');
  
  if (fs.existsSync(chromeDriverCmd)) {
    console.log('Found chromedriver.cmd at:', chromeDriverCmd);
    return chromeDriverCmd;
  }
  
  const chromeDriver = path.join(nodeModulesBin, 'chromedriver');
  if (fs.existsSync(chromeDriver)) {
    console.log('Found chromedriver at:', chromeDriver);
    return chromeDriver;
  }
  
  console.error('Could not find chromedriver in node_modules/.bin');
  return null;
};

// Get Chrome options that can be customized via command-line args
export const getChromeOptions = () => {
  const options = new chrome.Options();
  
  // Check if --headless flag was passed
  const isHeadless = process.argv.includes('--headless');
  
  if (isHeadless) {
    console.log('Running in headless mode');
    options.addArguments('--headless=new');
  }
  
  // Always add these options for stability
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  return options;
};

// Start ChromeDriver as a separate process
export const startChromeDriver = (port = 9516) => {
  const chromeDriverPath = findChromedriverPath();
  if (!chromeDriverPath) {
    throw new Error('ChromeDriver not found');
  }
  
  try {
    // First try to kill any existing chromedriver processes (Windows-specific)
    try {
      console.log('Attempting to kill any existing chromedriver processes...');
      crossSpawn.sync('taskkill', ['/f', '/im', 'chromedriver.exe'], { stdio: 'ignore' });
    } catch (e) {
      // Ignore errors here, as there might not be any processes to kill
    }
    
    console.log('Starting ChromeDriver as a separate process...');
    const process = crossSpawn(chromeDriverPath, [`--port=${port}`]);
    
    process.stdout.on('data', (data) => {
      if (data.toString().includes('ChromeDriver was started successfully')) {
        console.log('✅ ChromeDriver started successfully');
      }
    });
    
    process.stderr.on('data', (data) => {
      console.error(`ChromeDriver error: ${data.toString()}`);
    });
    
    process.on('close', (code) => {
      console.log(`ChromeDriver process exited with code ${code}`);
    });
    
    return process;
  } catch (error) {
    console.error('Error starting ChromeDriver:', error.message);
    throw error;
  }
}; 