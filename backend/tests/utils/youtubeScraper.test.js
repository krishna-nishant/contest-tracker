const { google } = require('googleapis');
const Contest = require('../../models/Contest');
const checkForNewSolutions = require('../../utils/youtubeScraper');

// Mock the modules
jest.mock('googleapis', () => ({
  google: {
    youtube: jest.fn().mockReturnValue({
      playlistItems: {
        list: jest.fn()
      }
    })
  }
}));

jest.mock('../../models/Contest', () => ({
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  updateMany: jest.fn()
}));

describe('YouTube Scraper Utility', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.YOUTUBE_API_KEY = 'test-api-key';
  });

  test('should update past contests', async () => {
    // Mock updateMany to simulate updating contests to past status
    Contest.updateMany.mockResolvedValue({ modifiedCount: 2 });
    
    // Mock find to return empty array (no contests need solutions)
    Contest.find.mockResolvedValue([]);

    // Execute the checkForNewSolutions function
    await checkForNewSolutions();

    // Verify updateMany was called with correct parameters
    expect(Contest.updateMany).toHaveBeenCalledWith(
      { start_time: expect.any(Object), past: { $ne: true } },
      { $set: { past: true } }
    );
  });

  test('should check contests without solutions', async () => {
    // Setup mocks
    Contest.updateMany.mockResolvedValue({ modifiedCount: 0 });
    
    // Mock past contests without solutions
    const mockContests = [
      { 
        _id: 'contest1', 
        title: 'Weekly Contest 300', 
        platform: 'LeetCode', 
        start_time: new Date('2023-01-01')
      }
    ];
    Contest.find.mockResolvedValue(mockContests);
    
    // Mock YouTube API response
    const mockYoutubeResponse = {
      data: {
        items: [
          {
            snippet: {
              title: 'LeetCode Weekly Contest 300 Solutions',
              resourceId: { videoId: 'abc123' },
              publishedAt: new Date().toISOString()
            }
          }
        ]
      }
    };
    
    google.youtube().playlistItems.list.mockResolvedValue(mockYoutubeResponse);
    Contest.findByIdAndUpdate.mockResolvedValue({});

    // Execute the function
    await checkForNewSolutions();

    // Verify the YouTube API was called
    expect(google.youtube().playlistItems.list).toHaveBeenCalled();
  });
}); 