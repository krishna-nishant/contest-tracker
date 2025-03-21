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

    return await response.json()
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
    
    console.log(`Found ${todaysContests.length} contests for today through client-side filtering`);
    return todaysContests;
  } catch (error) {
    console.error("Error fetching today's contests:", error);
    throw error;
  }
}

// Fetch only bookmarked contests
export const fetchBookmarkedContests = async () => {
  try {
    // Since there's no specific endpoint for bookmarked contests in your API,
    // we'll fetch all contests and filter on the client side
    const response = await fetch(`${API_BASE_URL}/contests`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.filter((contest) => contest.bookmarked)
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

    return await response.json()
  } catch (error) {
    console.error("Error fetching past contests:", error)
    throw error
  }
}

// Toggle bookmark status for a contest - FIXED
export const toggleBookmark = async (contestId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contests/bookmark/${contestId}`, {
      method: "POST", // Changed from PUT to POST to match your backend
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    throw error
  }
}

// Add solution link to a contest - FIXED
export const addSolutionLink = async (contestId, solutionLink) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contests/solution/${contestId}`, {
      method: "POST", // Changed from PUT to POST to match your backend
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

