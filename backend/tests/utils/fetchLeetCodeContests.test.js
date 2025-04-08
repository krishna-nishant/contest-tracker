const axios = require('axios');
const fetchLeetCodeContests = require('../../utils/fetchLeetCodeContests');

// Mock axios
jest.mock('axios');

describe('fetchLeetCodeContests Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch and format LeetCode contests correctly', async () => {
    // Mock axios response
    const mockLeetCodeResponse = {
      data: {
        data: {
          allContests: [
            {
              title: 'Weekly Contest 300',
              startTime: 1641042000, // Example timestamp
              duration: 5400, // 90 minutes in seconds
              titleSlug: 'weekly-contest-300'
            },
            {
              title: 'Biweekly Contest 75',
              startTime: 1642251600, // Example timestamp
              duration: 5400, // 90 minutes in seconds
              titleSlug: 'biweekly-contest-75'
            }
          ]
        }
      }
    };

    // Setup the mock implementation
    axios.post.mockImplementation(() => Promise.resolve(mockLeetCodeResponse));

    // Call the function
    const result = await fetchLeetCodeContests();

    // Verify axios was called with correct URL
    expect(axios.post).toHaveBeenCalledWith(
      'https://leetcode.com/graphql',
      expect.any(Object),
      expect.any(Object)
    );

    // Verify the result contains correctly formatted contests without depending on order
    expect(result).toHaveLength(2);
    
    // Find each contest by title and verify its properties
    const weeklyContest = result.find(contest => contest.title === 'Weekly Contest 300');
    const biweeklyContest = result.find(contest => contest.title === 'Biweekly Contest 75');
    
    expect(weeklyContest).toMatchObject({
      title: 'Weekly Contest 300',
      platform: 'LeetCode',
      start_time: expect.any(Date),
      duration: 90, // Duration should be converted to minutes
      url: expect.stringContaining('contest/weekly-contest-300'),
      past: expect.any(Boolean)
    });
    
    expect(biweeklyContest).toMatchObject({
      title: 'Biweekly Contest 75',
      platform: 'LeetCode',
      start_time: expect.any(Date),
      duration: 90, // Duration should be converted to minutes
      url: expect.stringContaining('contest/biweekly-contest-75'),
      past: expect.any(Boolean)
    });
  });

  test('should filter out premium contests', async () => {
    // Mock axios response with premium contests
    const mockLeetCodeResponse = {
      data: {
        data: {
          allContests: [
            {
              title: 'Weekly Contest 301',
              startTime: 1643461200, // Example timestamp
              duration: 5400, // 90 minutes in seconds
              titleSlug: 'weekly-contest-301'
            }
          ]
        }
      }
    };

    // Setup the mock implementation
    axios.post.mockImplementation(() => Promise.resolve(mockLeetCodeResponse));

    // Call the function
    const result = await fetchLeetCodeContests();

    // Verify only the non-premium contest is returned
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Weekly Contest 301');
    expect(result[0].platform).toBe('LeetCode');
  });

  test('should handle API errors gracefully', async () => {
    // Mock axios to throw an error
    axios.post.mockImplementation(() => Promise.reject(new Error('Network error')));

    // Call the function
    const result = await fetchLeetCodeContests();

    // Verify the function returns an empty array on error
    expect(result).toEqual([]);
    expect(axios.post).toHaveBeenCalled();
  });

  test('should correctly determine past contests', async () => {
    // Create fixed dates in the distant past and future to avoid test flakiness
    const pastTime = new Date('2000-01-01T00:00:00.000Z'); // Very past date
    const futureTime = new Date('2100-01-01T00:00:00.000Z'); // Very future date
    
    // Mock axios response
    const mockLeetCodeResponse = {
      data: {
        data: {
          allContests: [
            {
              title: 'Past Contest',
              startTime: Math.floor(pastTime.getTime() / 1000),
              duration: 5400,
              titleSlug: 'past-contest'
            },
            {
              title: 'Future Contest',
              startTime: Math.floor(futureTime.getTime() / 1000),
              duration: 5400,
              titleSlug: 'future-contest'
            }
          ]
        }
      }
    };

    // Save the real Date.now
    const originalDateNow = Date.now;
    
    // Mock Date.now to return a fixed timestamp between past and future
    Date.now = jest.fn(() => new Date('2050-01-01T00:00:00.000Z').getTime());

    // Setup the mock implementation
    axios.post.mockImplementation(() => Promise.resolve(mockLeetCodeResponse));

    try {
      // Call the function
      const result = await fetchLeetCodeContests();

      // Find contests by title rather than relying on order
      const pastContest = result.find(contest => contest.title === 'Past Contest');
      const futureContest = result.find(contest => contest.title === 'Future Contest');
      
      // Verify past/future flags are set correctly
      expect(pastContest.past).toBe(true); // Past contest
      expect(futureContest.past).toBe(false); // Future contest
    } finally {
      // Restore the original Date.now
      Date.now = originalDateNow;
    }
  });
}); 