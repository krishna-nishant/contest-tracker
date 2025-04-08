const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const contestRoutes = require('../../routes/contestRoutes');
const Contest = require('../../models/Contest');
const fetchContests = require('../../utils/fetchContests');

// Mock the fetchContests utility
jest.mock('../../utils/fetchContests');

// Create a test express app
const app = express();
app.use(express.json());
app.use('/api/contests', contestRoutes);

describe('Contest API Routes', () => {
  // Test data
  const testContests = [
    {
      title: 'Test Contest 1',
      platform: 'Codeforces',
      start_time: new Date('2023-11-30T10:00:00Z'),
      duration: 120,
      url: 'https://codeforces.com/contest/1234',
      past: false
    },
    {
      title: 'Test Contest 2',
      platform: 'LeetCode',
      start_time: new Date('2023-12-05T14:30:00Z'),
      duration: 90,
      url: 'https://leetcode.com/contest/weekly',
      past: false
    },
    {
      title: 'Past Contest',
      platform: 'CodeChef',
      start_time: new Date('2023-10-01T09:00:00Z'),
      duration: 180,
      url: 'https://codechef.com/contest/123',
      past: true,
      solution_link: 'https://www.youtube.com/watch?v=solution123'
    }
  ];

  // Before each test, seed the database with test contests
  beforeEach(async () => {
    await Contest.deleteMany({});
    await Contest.insertMany(testContests);
  });

  // Test the GET /api/contests endpoint
  describe('GET /api/contests', () => {
    test('should return all contests when no filters are provided', async () => {
      const res = await request(app)
        .get('/api/contests');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      
      // Instead of checking specific order, just check that all expected contests are present
      const titles = res.body.map(contest => contest.title);
      expect(titles).toContain('Test Contest 1');
      expect(titles).toContain('Test Contest 2');
      expect(titles).toContain('Past Contest');
    });
    
    it('should filter contests by platform', async () => {
      const res = await request(app).get('/api/contests?platform=Codeforces');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].platform).toBe('Codeforces');
      expect(res.body[0].title).toBe('Test Contest 1');
    });
    
    it('should filter past contests', async () => {
      const res = await request(app).get('/api/contests?past=true');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].past).toBe(true);
      expect(res.body[0].title).toBe('Past Contest');
    });
    
    it('should filter upcoming contests', async () => {
      const res = await request(app).get('/api/contests?past=false');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].past).toBe(false);
      expect(res.body[1].past).toBe(false);
    });
    
    it('should handle combined filters', async () => {
      const res = await request(app).get('/api/contests?platform=LeetCode&past=false');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].platform).toBe('LeetCode');
      expect(res.body[0].past).toBe(false);
    });
  });
  
  // Test the GET /api/contests/today endpoint
  describe('GET /api/contests/today', () => {
    it('should return contests scheduled for today', async () => {
      // Mock the current date to match one of our test contests
      const realDate = global.Date;
      const mockDate = new Date('2023-11-30T08:00:00Z'); // Same day as Test Contest 1
      
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return new realDate(mockDate);
          }
          return new realDate(...args);
        }
        
        static now() {
          return mockDate.getTime();
        }
      };
      
      const res = await request(app).get('/api/contests/today');
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Test Contest 1');
      
      // Restore the original Date
      global.Date = realDate;
    });
  });
  
  // Test the GET /api/contests/fetch endpoint
  describe('GET /api/contests/fetch', () => {
    it('should fetch and store contests', async () => {
      // Setup mock return value for fetchContests
      const mockNewContests = [
        {
          title: 'New Contest 1',
          platform: 'Codeforces',
          start_time: new Date('2023-12-15T10:00:00Z'),
          duration: 120,
          url: 'https://codeforces.com/contest/9999',
          past: false
        },
        {
          title: 'New Contest 2',
          platform: 'LeetCode',
          start_time: new Date('2023-12-20T14:30:00Z'),
          duration: 90,
          url: 'https://leetcode.com/contest/biweekly',
          past: false
        }
      ];
      
      fetchContests.mockResolvedValue(mockNewContests);
      
      const res = await request(app).get('/api/contests/fetch');
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Contests fetched and stored successfully!');
      
      // Verify the contests were stored in the database
      const storedContests = await Contest.find({});
      expect(storedContests.length).toBe(5); // 3 original + 2 new contests
      
      // Check that new contests were added
      const newContestTitles = storedContests.map(c => c.title);
      expect(newContestTitles).toContain('New Contest 1');
      expect(newContestTitles).toContain('New Contest 2');
    });
    
    it('should handle errors when fetching contests', async () => {
      // Make fetchContests throw an error
      fetchContests.mockRejectedValue(new Error('API error'));
      
      const res = await request(app).get('/api/contests/fetch');
      
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch and store contests');
    });
  });
  
  // Test the POST /api/contests/solution/:id endpoint
  describe('POST /api/contests/solution/:id', () => {
    it('should add a solution link to an existing contest', async () => {
      // First get a contest to use its ID
      const contests = await Contest.find({});
      const contestId = contests[0]._id.toString();
      
      const res = await request(app)
        .post(`/api/contests/solution/${contestId}`)
        .send({ solution_link: 'https://www.youtube.com/watch?v=newsolution' });
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Solution link updated');
      expect(res.body.solution_link).toBe('https://www.youtube.com/watch?v=newsolution');
      
      // Verify the solution link was updated in the database
      const updatedContest = await Contest.findById(contestId);
      expect(updatedContest.solution_link).toBe('https://www.youtube.com/watch?v=newsolution');
    });
    
    it('should reject invalid solution links', async () => {
      const contests = await Contest.find({});
      const contestId = contests[0]._id.toString();
      
      const res = await request(app)
        .post(`/api/contests/solution/${contestId}`)
        .send({ solution_link: 'invalid-url' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid YouTube link');
    });
    
    it('should return 404 for non-existent contest ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .post(`/api/contests/solution/${nonExistentId}`)
        .send({ solution_link: 'https://www.youtube.com/watch?v=newsolution' });
      
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Contest not found');
    });
  });
}); 