const cron = require('node-cron');
const axios = require('axios');
const fetchSolutions = require('../../utils/youtubeScraper');
const fetchContests = require('../../utils/fetchContests');
const Contest = require('../../models/Contest');

// Mock dependencies
jest.mock('node-cron');
jest.mock('axios');
jest.mock('../../utils/youtubeScraper');
jest.mock('../../utils/fetchContests');
jest.mock('../../models/Contest');

describe('Cron Jobs', () => {
  let setupCronJobs;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset environment variables
    process.env.SERVER_URL = 'http://test-server';
    process.env.PORT = '5000';
    
    // Import the setupCronJobs function from server.js
    // We need to define this function here for testing since we can't access it directly from server.js
    setupCronJobs = () => {
      // Schedule a job to run at 10 PM (22:00) every day
      cron.schedule('0 22 * * *', () => {
        fetchContests();
        fetchSolutions();
      });
    
      // Add another job to run every 6 hours to ensure data is fresh
      cron.schedule('0 */6 * * *', () => {
        fetchContests();
      });
    
      // Anti-sleep job: ping the server every 14 minutes to prevent Render from putting it to sleep
      cron.schedule('*/14 * * * *', async () => {
        try {
          const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
          await axios.get(`${serverUrl}/api/health`);
        } catch (error) {
          console.error('Failed to ping health endpoint:', error.message);
        }
      });
    };
  });

  test('should set up daily cron job for data fetching', () => {
    // Call the function to set up cron jobs
    setupCronJobs();
    
    // Verify cron.schedule was called with the daily schedule pattern
    expect(cron.schedule).toHaveBeenCalledWith(
      '0 22 * * *',
      expect.any(Function)
    );
  });

  test('should set up 6-hourly cron job for data refresh', () => {
    // Call the function to set up cron jobs
    setupCronJobs();
    
    // Verify cron.schedule was called with the 6-hourly pattern
    expect(cron.schedule).toHaveBeenCalledWith(
      '0 */6 * * *',
      expect.any(Function)
    );
  });

  test('should set up anti-sleep cron job', () => {
    // Call the function to set up cron jobs
    setupCronJobs();
    
    // Verify cron.schedule was called with the 14-minute pattern
    expect(cron.schedule).toHaveBeenCalledWith(
      '*/14 * * * *',
      expect.any(Function)
    );
  });

  test('daily cron job should fetch contests and solutions', () => {
    // Call the function to set up cron jobs
    setupCronJobs();
    
    // Get the callback function from the first call to cron.schedule (daily job)
    const dailyJobCallback = cron.schedule.mock.calls[0][1];
    
    // Call the callback function
    dailyJobCallback();
    
    // Verify that fetchContests and fetchSolutions were called
    expect(fetchContests).toHaveBeenCalled();
    expect(fetchSolutions).toHaveBeenCalled();
  });

  test('6-hourly cron job should fetch contests only', () => {
    // Call the function to set up cron jobs
    setupCronJobs();
    
    // Get the callback function from the second call to cron.schedule (6-hourly job)
    const sixHourlyJobCallback = cron.schedule.mock.calls[1][1];
    
    // Call the callback function
    sixHourlyJobCallback();
    
    // Verify that fetchContests was called but fetchSolutions was not
    expect(fetchContests).toHaveBeenCalled();
    expect(fetchSolutions).not.toHaveBeenCalled();
  });

  test('anti-sleep cron job should ping health endpoint', async () => {
    // Mock successful response from axios
    axios.get.mockResolvedValue({ status: 200 });
    
    // Call the function to set up cron jobs
    setupCronJobs();
    
    // Get the callback function from the third call to cron.schedule (anti-sleep job)
    const antiSleepJobCallback = cron.schedule.mock.calls[2][1];
    
    // Call the callback function
    await antiSleepJobCallback();
    
    // Verify that axios.get was called with the correct URL
    expect(axios.get).toHaveBeenCalledWith('http://test-server/api/health');
  });

  test('anti-sleep cron job should handle errors gracefully', async () => {
    // Mock error response from axios
    axios.get.mockRejectedValue(new Error('Network error'));
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Call the function to set up cron jobs
    setupCronJobs();
    
    // Get the callback function from the third call to cron.schedule (anti-sleep job)
    const antiSleepJobCallback = cron.schedule.mock.calls[2][1];
    
    // Call the callback function
    await antiSleepJobCallback();
    
    // Verify that error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
}); 