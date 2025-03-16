// "use client"

// const { google } = require("googleapis")
// const Contest = require("../models/Contest")
// const stringSimilarity = require("string-similarity")
// require("dotenv").config()

// const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
// const youtube = google.youtube({ version: "v3", auth: YOUTUBE_API_KEY })

// // Playlists for each platform
// const PLAYLISTS = {
//   LeetCode: "PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr",
//   Codeforces: "PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB",
//   CodeChef: "PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr",
// }

// // Different thresholds for different platforms
// const THRESHOLDS = {
//   LeetCode: 0.5,
//   Codeforces: 0.5,
//   CodeChef: 0.4,
// }

// // Basic function to clean and standardize titles for comparison
// const cleanTitle = (title) => {
//   return title
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/g, "") // Remove special characters
//     .replace(/\s+/g, " ") // Replace multiple spaces with a single space
//     .trim()
// }

// // LeetCode-specific matching algorithm
// const matchLeetCodeContest = (videoTitle, contestTitle) => {
//   // Convert titles to lowercase for case-insensitive matching
//   const videoLower = videoTitle.toLowerCase()
//   const contestLower = contestTitle.toLowerCase()

//   // Extract contest type and number
//   const videoMatch = videoLower.match(/\b(weekly|biweekly)\s+contest\s+(\d+)\b/i)
//   const contestMatch = contestLower.match(/\b(weekly|biweekly)\s+contest\s+(\d+)\b/i)

//   // If both have contest numbers
//   if (videoMatch && contestMatch) {
//     const videoType = videoMatch[1] // weekly or biweekly
//     const videoNumber = videoMatch[2] // contest number

//     const contestType = contestMatch[1]
//     const contestNumber = contestMatch[2]

//     // Both type and number must match exactly
//     if (videoType === contestType && videoNumber === contestNumber) {
//       return 0.9 // Very high match - exact contest
//     } else {
//       return 0.1 // Very low match - different contests
//     }
//   }

//   // Fall back to standard similarity
//   return stringSimilarity.compareTwoStrings(cleanTitle(videoTitle), cleanTitle(contestTitle))
// }

// // Codeforces-specific matching algorithm
// const matchCodeforcesContest = (videoTitle, contestTitle) => {
//   // Convert titles to lowercase for case-insensitive matching
//   const videoLower = videoTitle.toLowerCase()
//   const contestLower = contestTitle.toLowerCase()

//   // Extract round number and division
//   const videoMatch = videoLower.match(
//     /\bcodeforces\s+(?:round|educational)\s+(\d+)(?:\s*\(?\s*(?:div\.\s*(\d+)|rated|unrated))?/i,
//   )
//   const contestMatch = contestLower.match(
//     /\bcodeforces\s+(?:round|educational)\s+(\d+)(?:\s*\(?\s*(?:div\.\s*(\d+)|rated|unrated))?/i,
//   )

//   // If both have round numbers
//   if (videoMatch && contestMatch) {
//     const videoRound = videoMatch[1] // round number
//     const videoDiv = videoMatch[2] || "" // division (may be undefined)

//     const contestRound = contestMatch[1]
//     const contestDiv = contestMatch[2] || "" // division (may be undefined)

//     // Round number must match exactly
//     if (videoRound === contestRound) {
//       // If division also matches or at least one doesn't specify division
//       if (videoDiv === contestDiv || !videoDiv || !contestDiv) {
//         return 0.9 // Very high match
//       } else {
//         return 0.4 // Medium match - same round but different division
//       }
//     } else {
//       return 0.1 // Very low match - different rounds
//     }
//   }

//   // Fall back to standard similarity
//   return stringSimilarity.compareTwoStrings(cleanTitle(videoTitle), cleanTitle(contestTitle))
// }

// // CodeChef-specific matching algorithm
// const matchCodeChefContest = (videoTitle, contestTitle) => {
//   // For now, use the standard similarity
//   return stringSimilarity.compareTwoStrings(cleanTitle(videoTitle), cleanTitle(contestTitle))
// }

// // Fetch new videos with improved error handling
// const fetchNewVideos = async (playlistId) => {
//   try {
//     console.log(`🔍 Attempting to fetch videos from playlist: ${playlistId}`)

//     const response = await youtube.playlistItems.list({
//       part: "snippet",
//       playlistId,
//       maxResults: 50, // Fetch latest 50 videos
//     })

//     console.log(`✅ Successfully fetched ${response.data.items.length} videos from playlist`)

//     return response.data.items.map((video) => ({
//       title: video.snippet.title,
//       link: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
//       publishedAt: new Date(video.snippet.publishedAt).getTime(),
//     }))
//   } catch (error) {
//     console.error(`❌ Error fetching videos from playlist ${playlistId}:`, error.response?.data?.error || error.message)
//     return []
//   }
// }

// // Function to update contests to past status if they've already happened
// const updatePastContests = async () => {
//   try {
//     const now = new Date()
//     const updatedContests = await Contest.updateMany(
//       {
//         start_time: { $lt: now },
//         past: { $ne: true },
//       },
//       { $set: { past: true } },
//     )

//     if (updatedContests.modifiedCount > 0) {
//       console.log(`🔄 Updated ${updatedContests.modifiedCount} contests to past status`)
//     }
//   } catch (err) {
//     console.error("❌ Error updating past contests past contests:", err)
//   }
// }

// // Enhanced matching algorithm for contest solutions - now checks ALL past contests
// const checkForNewSolutions = async () => {
//   console.log("🔍 Checking for new YouTube solutions...")

//   // First update past contests status
//   await updatePastContests()

//   // Find ALL past contests - even those with existing solutions
//   const pastContests = await Contest.find({ past: true })
//   console.log(`Found ${pastContests.length} total past contests to check`)

//   for (const contest of pastContests) {
//     const playlistId = PLAYLISTS[contest.platform]
//     if (!playlistId) {
//       console.log(`⚠️ No playlist configured for platform: ${contest.platform}`)
//       continue
//     }

//     const videos = await fetchNewVideos(playlistId)
//     if (videos.length === 0) {
//       console.log(`⚠️ No videos found for platform: ${contest.platform}`)
//       continue
//     }

//     let bestMatch = { score: 0, link: null, videoTitle: null }

//     for (const video of videos) {
//       // Use platform-specific matching algorithms
//       let similarity

//       if (contest.platform === "LeetCode") {
//         similarity = matchLeetCodeContest(video.title, contest.title)
//       } else if (contest.platform === "Codeforces") {
//         similarity = matchCodeforcesContest(video.title, contest.title)
//       } else if (contest.platform === "CodeChef") {
//         similarity = matchCodeChefContest(video.title, contest.title)
//       } else {
//         // Fallback to general string similarity
//         similarity = stringSimilarity.compareTwoStrings(cleanTitle(video.title), cleanTitle(contest.title))
//       }

//       console.log(`🔍 [${contest.platform}] Comparing: "${video.title}" with "${contest.title}" (Score: ${similarity})`)

//       if (similarity > bestMatch.score) {
//         bestMatch = { score: similarity, link: video.link, videoTitle: video.title }
//       }
//     }

//     // Use platform-specific thresholds
//     const threshold = THRESHOLDS[contest.platform] || 0.4

//     if (bestMatch.score > threshold) {
//       // Check if this is different from the existing solution
//       if (!contest.solution_link || contest.solution_link !== bestMatch.link) {
//         await Contest.findByIdAndUpdate(contest._id, { solution_link: bestMatch.link })

//         if (contest.solution_link) {
//           console.log(`🔄 Updated Solution for ${contest.title}`)
//           console.log(`   Old Link: ${contest.solution_link}`)
//           console.log(`   New Link: ${bestMatch.link}`)
//         } else {
//           console.log(`✅ New Solution Added for ${contest.title}: ${bestMatch.link}`)
//         }

//         console.log(`   Video Title: ${bestMatch.videoTitle}`)
//         console.log(`   Match Score: ${bestMatch.score}`)
//       } else {
//         console.log(`✓ Existing solution for "${contest.title}" is still the best match`)
//       }
//     } else {
//       console.log(
//         `❌ No good match found for "${contest.title}" (Best score: ${bestMatch.score}, threshold: ${threshold})`,
//       )
//     }
//   }

//   console.log("✅ Finished checking for YouTube solutions")
// }

// // Run every 6 hours
// const scheduleInterval = 6 * 60 * 60 * 1000
// setInterval(checkForNewSolutions, scheduleInterval)

// // Run immediately on startup
// checkForNewSolutions();

// module.exports = checkForNewSolutions



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

// ✅ **Find a Matching Video**
const findMatchingVideo = (videos, contestTitle, platform) => {
  const cleanedContestTitle = cleanTitle(contestTitle);

  for (const video of videos) {
    const cleanedVideoTitle = cleanTitle(video.title);

    if (platform === "LeetCode") {
      const match = cleanedVideoTitle.match(/weekly contest (\d+)|biweekly contest (\d+)/);
      const contestMatch = cleanedContestTitle.match(/weekly contest (\d+)|biweekly contest (\d+)/);
      
      if (match && contestMatch) {
        if (match[1] === contestMatch[1] || match[2] === contestMatch[2]) {
          return video;
        }
      }
    }

    if (platform === "Codeforces") {
      const match = cleanedVideoTitle.match(/codeforces round (\d+)(?: div (\d+))?/);
      const contestMatch = cleanedContestTitle.match(/codeforces round (\d+)(?: div (\d+))?/);

      if (match && contestMatch) {
        if (match[1] === contestMatch[1] && (!match[2] || match[2] === contestMatch[2])) {
          return video;
        }
      }
    }

    if (platform === "CodeChef") {
      const match = cleanedVideoTitle.match(/starters (\d+)/);
      const contestMatch = cleanedContestTitle.match(/starters (\d+)/);

      if (match && contestMatch && match[1] === contestMatch[1]) {
        return video;
      }
    }
  }

  return null;
};

// ✅ **Check for New Solutions**
const checkForNewSolutions = async () => {
  console.log("🔍 Checking for new YouTube solutions...");

  // **Find past contests without solutions**
  const pastContests = await Contest.find({ past: true, solution_link: { $exists: false } });
  console.log(`📌 Checking ${pastContests.length} past contests for solutions`);

  for (const contest of pastContests) {
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
      console.log(`✅ Solution added for ${contest.title}: ${bestMatch.link}`);
    } else {
      console.log(`❌ No matching video found for ${contest.title}`);
    }
  }

  console.log("✅ Finished checking for YouTube solutions");
};

// **Run the function immediately & every 6 hours**
setInterval(checkForNewSolutions, 6 * 60 * 60 * 1000);

module.exports = checkForNewSolutions;
