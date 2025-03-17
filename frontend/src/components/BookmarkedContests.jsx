"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { fetchBookmarkedContests, toggleBookmark } from "../services/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, ExternalLink, Clock, Video } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

function BookmarkedContests() {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookmarkedContests()
  }, [])

  const loadBookmarkedContests = async () => {
    setLoading(true)
    try {
      const data = await fetchBookmarkedContests()
      setContests(data)
    } catch (error) {
      console.error("Failed to load bookmarked contests:", error)
      toast.error("Failed to load bookmarks", {
        description: "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBookmark = async (id) => {
    try {
      await toggleBookmark(id)
      setContests(contests.filter((contest) => contest._id !== id))
      toast.success("Bookmark removed", {
        description: "Contest removed from bookmarks",
      })
    } catch (error) {
      console.error("Failed to toggle bookmark:", error)
      toast.error("Failed to remove bookmark", {
        description: "Please try again later",
      })
    }
  }

  const getPlatformColor = (platform) => {
    switch (platform) {
      case "LeetCode":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "Codeforces":
        return "bg-red-500 hover:bg-red-600"
      case "CodeChef":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available"
    const date = new Date(dateString)
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (minutes) => {
    if (!minutes) return ""
    if (minutes < 60) return `${minutes} hrs`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes ? `${hours}hrs ${remainingMinutes}m` : `${hours}hrs`
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-[250px]" />
                    <Skeleton className="h-4 w-[180px]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-[100px]" />
                    <Skeleton className="h-9 w-[100px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : contests.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Bookmark className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No bookmarked contests</h3>
          <p className="text-muted-foreground mt-2">Save contests from the home page to see them here</p>
          <Button className="mt-4" asChild>
            <Link to="/">Browse Contests</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contests.map((contest) => (
            <Card key={contest._id} className="overflow-hidden h-full">
              <CardContent className="p-0 h-full">
                <div className="p-6 flex flex-col justify-between h-full">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <h3 className="font-medium text-lg line-clamp-1 mr-auto">
                        {contest.title || "Untitled Contest"}
                      </h3>
                      <Badge variant="outline" className={`${getPlatformColor(contest.platform)} text-white`}>
                        {contest.platform}
                      </Badge>
                      {contest.duration && (
                        <Badge variant="outline" className="bg-purple-500 hover:bg-purple-600 text-white">
                          {formatDuration(contest.duration)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      {formatDate(contest.start_time)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    {contest.past && contest.solution_link && (
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <a href={contest.solution_link} target="_blank" rel="noopener noreferrer">
                          <Video className="mr-2 h-4 w-4" />
                          Solution
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <a href={contest.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Visit
                      </a>
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleToggleBookmark(contest._id)}
                      className="flex-1"
                    >
                      <Bookmark className="mr-2 h-4 w-4 fill-current" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookmarkedContests

