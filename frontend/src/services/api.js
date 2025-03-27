// API service for the contest tracker
const API_BASE_URL = "https://contest-tracker-248k.onrender.com/api"

// Export the API_BASE_URL for use in other components
export { API_BASE_URL }

// Fetch all contests with optional filters
export const fetchContests = async (platform = "", past = "") => {
  try {
    let url = `${API_BASE_URL}/contests`

    // Add query parameters if provided
    const params = new URLSearchParams()
    if (platform) params.append("platform", platform)
    if (past) params.append("past", past)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const contests = await response.json()

    // Apply local bookmarks to contests from API
    const bookmarkedIds = getBookmarkedIds()
    return contests.map(contest => ({
      ...contest,
      bookmarked: bookmarkedIds.includes(contest._id)
    }))
  } catch (error) {
    console.error("Error fetching contests:", error)
    throw error
  }
}

// Fetch today's contests
export const fetchTodaysContests = async () => {
  try {
    console.log(`Fetching today's contests...`);

    // Get all contests first for client-side filtering
    const allContestsResponse = await fetch(`${API_BASE_URL}/contests`);
    if (!allContestsResponse.ok) {
      throw new Error(`API error: ${allContestsResponse.status}`);
    }

    const allContests = await allContestsResponse.json();
    console.log(`Successfully fetched ${allContests.length} total contests`);

    // Filter today's contests client-side to handle timezone issues
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysContests = allContests.filter(contest => {
      const contestDate = new Date(contest.start_time);
      return contestDate >= today && contestDate < tomorrow;
    });

    // Apply local bookmarks to contests
    const bookmarkedIds = getBookmarkedIds()
    const contestsWithBookmarks = todaysContests.map(contest => ({
      ...contest,
      bookmarked: bookmarkedIds.includes(contest._id)
    }))

    console.log(`Found ${todaysContests.length} contests for today through client-side filtering`);
    return contestsWithBookmarks;
  } catch (error) {
    console.error("Error fetching today's contests:", error);
    throw error;
  }
}

// Helper functions for localStorage bookmarks
const getBookmarkedIds = () => {
  const bookmarksJson = localStorage.getItem('bookmarkedContests') || '[]'
  return JSON.parse(bookmarksJson)
}

const saveBookmarkedIds = (bookmarkedIds) => {
  localStorage.setItem('bookmarkedContests', JSON.stringify(bookmarkedIds))
}

// Fetch only bookmarked contests
export const fetchBookmarkedContests = async () => {
  try {
    // Get all contests from API
    const response = await fetch(`${API_BASE_URL}/contests`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const allContests = await response.json()

    // Filter by bookmarked IDs from localStorage
    const bookmarkedIds = getBookmarkedIds()
    return allContests.filter(contest => bookmarkedIds.includes(contest._id))
  } catch (error) {
    console.error("Error fetching bookmarked contests:", error)
    throw error
  }
}

// Fetch only past contests
export const fetchPastContests = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/contests?past=true`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const contests = await response.json()

    // Apply local bookmarks to past contests
    const bookmarkedIds = getBookmarkedIds()
    return contests.map(contest => ({
      ...contest,
      bookmarked: bookmarkedIds.includes(contest._id)
    }))
  } catch (error) {
    console.error("Error fetching past contests:", error)
    throw error
  }
}

// Toggle bookmark status for a contest using localStorage
export const toggleBookmark = async (contestId) => {
  try {
    const bookmarkedIds = getBookmarkedIds()

    let newBookmarkedIds
    if (bookmarkedIds.includes(contestId)) {
      // Remove bookmark
      newBookmarkedIds = bookmarkedIds.filter(id => id !== contestId)
    } else {
      // Add bookmark
      newBookmarkedIds = [...bookmarkedIds, contestId]
    }

    saveBookmarkedIds(newBookmarkedIds)

    return {
      message: "Bookmark updated",
      bookmarked: newBookmarkedIds.includes(contestId)
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    throw error
  }
}

// Add solution link to a contest - Keep this server-side since it's not user-specific
export const addSolutionLink = async (contestId, solutionLink) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contests/solution/${contestId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ solution_link: solutionLink }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error adding solution link:", error)
    throw error
  }
}

