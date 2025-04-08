const mongoose = require('mongoose');
const Contest = require('../../models/Contest');

describe('Contest Model Tests', () => {
  
  const validContestData = {
    title: 'Test Contest',
    platform: 'Codeforces',
    start_time: new Date('2023-11-15T10:00:00Z'),
    duration: 120,
    url: 'https://codeforces.com/contest/1234',
    past: false
  };

  it('should create a valid contest', async () => {
    const validContest = new Contest(validContestData);
    const savedContest = await validContest.save();
    
    // Object Id should be defined when successfully saved to MongoDB
    expect(savedContest._id).toBeDefined();
    expect(savedContest.title).toBe(validContestData.title);
    expect(savedContest.platform).toBe(validContestData.platform);
    expect(savedContest.duration).toBe(validContestData.duration); 
    expect(savedContest.url).toBe(validContestData.url);
    expect(savedContest.past).toBe(validContestData.past);
    expect(savedContest.solution_link).toBeUndefined();
  });

  it('should fail to create a contest without required fields', async () => {
    // Missing required fields
    const contestWithoutRequiredField = new Contest({
      title: 'Missing Fields Contest',
      platform: 'LeetCode'
      // Missing duration and url fields
    });

    // Validation should fail
    let error;
    try {
      await contestWithoutRequiredField.save();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.duration).toBeDefined();
    expect(error.errors.url).toBeDefined();
  });

  it('should add a solution link to an existing contest', async () => {
    // First create and save a contest
    const contest = new Contest(validContestData);
    const savedContest = await contest.save();
    
    // Update the contest with a solution link
    savedContest.solution_link = 'https://www.youtube.com/watch?v=test123';
    const updatedContest = await savedContest.save();
    
    expect(updatedContest.solution_link).toBe('https://www.youtube.com/watch?v=test123');
  });

  it('should update a contest to mark it as past', async () => {
    // First create and save a contest
    const contest = new Contest(validContestData);
    const savedContest = await contest.save();
    
    // Update the contest to mark it as past
    savedContest.past = true;
    const updatedContest = await savedContest.save();
    
    expect(updatedContest.past).toBe(true);
  });

  it('should successfully find contests by platform', async () => {
    // Create multiple contests with different platforms
    const codeforces1 = new Contest({
      ...validContestData,
      title: 'Codeforces Round 1'
    });
    
    const codeforces2 = new Contest({
      ...validContestData,
      title: 'Codeforces Round 2'
    });
    
    const leetcode = new Contest({
      ...validContestData,
      title: 'LeetCode Weekly Contest',
      platform: 'LeetCode'
    });
    
    await codeforces1.save();
    await codeforces2.save();
    await leetcode.save();
    
    // Find all Codeforces contests
    const codeforcesContests = await Contest.find({ platform: 'Codeforces' });
    
    expect(codeforcesContests.length).toBe(2);
    expect(codeforcesContests[0].platform).toBe('Codeforces');
    expect(codeforcesContests[1].platform).toBe('Codeforces');
  });
}); 