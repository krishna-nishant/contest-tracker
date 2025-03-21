"use client";

const { google } = require("googleapis");
const Contest = require("../models/Contest");
require("dotenv").config();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: "v3", auth: YOUTUBE_API_KEY });

// ✅ **Define YouTube Playlists for Each Platform**
const PLAYLISTS = {
  LeetCode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
  Codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
  CodeChef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
};

// ✅ **Fetch Videos from a Playlist**
const fetchNewVideos = async (playlistId) => {
  try {
    console.log(`🔍 Fetching videos from YouTube playlist: ${playlistId}`);

    const response = await youtube.playlistItems.list({
      part: "snippet",
      playlistId,
      maxResults: 100,
    });

    console.log(`✅ Fetched ${response.data.items.length} videos from playlist`);

    return response.data.items.map((video) => ({
      title: video.snippet.title.toLowerCase(),
      link: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
      publishedAt: new Date(video.snippet.publishedAt).getTime(),
    }));
  } catch (error) {
    console.error(`❌ Error fetching videos from playlist ${playlistId}:`, error.response?.data?.error || error.message);
    return [];
  }
};

// ✅ **Clean and Normalize Titles**
const cleanTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim();
};

// ✅ **Find a Matching Video with Enhanced Precision**
const findMatchingVideo = (videos, contestTitle, platform) => {
  const cleanedContestTitle = cleanTitle(contestTitle);
  console.log(`🔍 Looking for match for ${platform} contest: "${contestTitle}"`);
  
  // Sort videos by published date (newest first) to prefer recent solutions
  const sortedVideos = [...videos].sort((a, b) => b.publishedAt - a.publishedAt);
  
  // Platform-specific matchers
  if (platform === "LeetCode") {
    // Extract exact contest type and number from contest title
    const contestMatch = cleanedContestTitle.match(/\b(weekly|biweekly)\s+contest\s+(\d+)\b/i);
    if (!contestMatch) {
      console.log(`⚠️ Could not extract contest number from LeetCode title: "${contestTitle}"`);
      return null;
    }
    
    const contestType = contestMatch[1].toLowerCase(); // "weekly" or "biweekly"
    const contestNumber = contestMatch[2]; // The contest number
    
    console.log(`🔎 Looking for ${contestType} contest ${contestNumber}`);
    
    // Find exact match for contest type and number
    for (const video of sortedVideos) {
      const cleanedVideoTitle = cleanTitle(video.title);
      // Look for exact contest type and number
      const videoMatch = cleanedVideoTitle.match(
        new RegExp(`\\b(${contestType})\\s+contest\\s+(${contestNumber})\\b`, 'i')
      );
      
      if (videoMatch) {
        console.log(`✅ Exact match found: "${video.title}"`);
        return video;
      }
    }
    
    console.log(`❌ No exact match found for ${contestType} contest ${contestNumber}`);
  } 
  else if (platform === "Codeforces") {
    // For Codeforces, extract round number and division
    const contestMatch = cleanedContestTitle.match(/\bcodeforces\s+(?:round|educational)\s+(\d+)(?:\s*(?:div\.?\s*(\d+)|rated|unrated))?\b/i);
    
    if (!contestMatch) {
      console.log(`⚠️ Could not extract round number from Codeforces title: "${contestTitle}"`);
      return null;
    }
    
    const roundNumber = contestMatch[1]; // Round number
    const division = contestMatch[2] || ""; // Division (might be undefined)
    
    const isEducational = cleanedContestTitle.includes("educational");
    
    console.log(`🔎 Looking for Codeforces ${isEducational ? "Educational " : ""}Round ${roundNumber}${division ? ` Div ${division}` : ""}`);
    
    for (const video of sortedVideos) {
      const cleanedVideoTitle = cleanTitle(video.title);
      
      // Check if educational status matches
      const videoIsEducational = cleanedVideoTitle.includes("educational");
      if (isEducational !== videoIsEducational) continue;
      
      // Look for round number
      const videoMatch = cleanedVideoTitle.match(/\bcodeforces\s+(?:round|educational)\s+(\d+)(?:\s*(?:div\.?\s*(\d+)|rated|unrated))?\b/i);
      
      if (videoMatch && videoMatch[1] === roundNumber) {
        // If division is specified in the contest, it must match exactly in the video
        if (!division || !videoMatch[2] || videoMatch[2] === division) {
          console.log(`✅ Match found: "${video.title}"`);
          return video;
        }
      }
    }
    
    console.log(`❌ No exact match found for Codeforces Round ${roundNumber}${division ? ` Div ${division}` : ""}`);
  } 
  else if (platform === "CodeChef") {
    // For CodeChef, extract contest type and number
    let contestMatch = cleanedContestTitle.match(/\b(starters|cookoff|lunchtime|long challenge)\s+(\d+)\b/i);
    
    if (!contestMatch) {
      console.log(`⚠️ Could not extract contest details from CodeChef title: "${contestTitle}"`);
      return null;
    }
    
    const contestType = contestMatch[1].toLowerCase(); // "starters", "cookoff", etc.
    const contestNumber = contestMatch[2]; // Contest number
    
    console.log(`🔎 Looking for CodeChef ${contestType} ${contestNumber}`);
    
    for (const video of sortedVideos) {
      const cleanedVideoTitle = cleanTitle(video.title);
      
      // Look for exact match with contest type and number
      const videoMatch = cleanedVideoTitle.match(
        new RegExp(`\\b${contestType}\\s+${contestNumber}\\b`, 'i')
      );
      
      if (videoMatch) {
        console.log(`✅ Match found: "${video.title}"`);
        return video;
      }
    }
    
    console.log(`❌ No exact match found for CodeChef ${contestType} ${contestNumber}`);
  }
  
  // If no match found with strict matching, return null
  return null;
};

// ✅ **Check for New Solutions**
const checkForNewSolutions = async () => {
  console.log("🔍 Checking for new YouTube solutions...");

  // First, update contests to past status if they're already over
  const now = new Date();
  try {
    const updateResult = await Contest.updateMany(
      { start_time: { $lt: now }, past: { $ne: true } }, 
      { $set: { past: true } }
    );
    
    if (updateResult.modifiedCount > 0) {
      console.log(`🔄 Updated ${updateResult.modifiedCount} contests to past status`);
    }
  } catch (err) {
    console.error("❌ Error updating contests to past status:", err);
  }

  // Only check past contests WITHOUT existing solution links
  const pastContestsWithoutSolutions = await Contest.find({ 
    past: true,
    $or: [
      { solution_link: { $exists: false } },
      { solution_link: null },
      { solution_link: "" }
    ]
  });
  
  console.log(`📌 Checking ${pastContestsWithoutSolutions.length} past contests without solutions`);

  // If no contests need solutions, exit early
  if (pastContestsWithoutSolutions.length === 0) {
    console.log("✓ No contests need solutions - skipping YouTube API calls");
    return;
  }

  // Process contests in reverse chronological order (newest first)
  pastContestsWithoutSolutions.sort((a, b) => b.start_time - a.start_time);
  
  for (const contest of pastContestsWithoutSolutions) {
    const playlistId = PLAYLISTS[contest.platform];

    if (!playlistId) {
      console.log(`⚠️ No playlist found for platform: ${contest.platform}`);
      continue;
    }

    // **Fetch videos from the correct playlist**
    const videos = await fetchNewVideos(playlistId);
    if (videos.length === 0) {
      console.log(`⚠️ No videos found for ${contest.platform}`);
      continue;
    }

    // **Find a matching video**
    const bestMatch = findMatchingVideo(videos, contest.title, contest.platform);

    if (bestMatch) {
      await Contest.findByIdAndUpdate(contest._id, { solution_link: bestMatch.link });
      console.log(`✅ Added new solution for ${contest.title}: ${bestMatch.link}`);
    } else {
      console.log(`❌ No matching video found for ${contest.title}`);
    }
  }

  console.log("✅ Finished checking for YouTube solutions");
};

// **Run the function immediately & every 6 hours**
setInterval(checkForNewSolutions, 6 * 60 * 60 * 1000);

module.exports = checkForNewSolutions;
