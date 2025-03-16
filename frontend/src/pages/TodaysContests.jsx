import { useState, useEffect } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { Calendar } from "lucide-react"

function TodaysContests() {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTodaysContests = async () => {
      try {
        const response = await axios.get("/api/contests") // Adjust API endpoint if needed
        const allContests = response.data

        // Get today's **start and end times in UTC**
        const now = new Date()
        const todayStartUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0))
        const todayEndUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59))

        // Filter contests that start **between today’s UTC start & end**
        const todaysFiltered = allContests.filter(contest => {
          const contestDate = new Date(contest.start_time) // Stored in UTC
          return contestDate >= todayStartUTC && contestDate <= todayEndUTC
        })

        setContests(todaysFiltered)
      } catch (error) {
        console.error("❌ Error fetching today's contests:", error.message)
      }
      setLoading(false)
    }

    fetchTodaysContests()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold flex items-center">
        <Calendar className="mr-2 h-6 w-6" />
        Today's Contests
      </h1>

      {loading ? (
        <p className="text-gray-500 mt-4">Loading...</p>
      ) : contests.length === 0 ? (
        <p className="text-gray-500 mt-4">No contests happening today.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {contests.map(contest => (
            <li key={contest.title} className="text-lg">
              <a href={contest.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {contest.title} ({new Date(contest.start_time).toLocaleTimeString()})
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <Link to="/" className="text-blue-500 hover:underline">← Back to Home</Link>
      </div>
    </div>
  )
}

export default TodaysContests
