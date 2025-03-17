"use client"

import { useState, useEffect } from "react"
import { fetchContests, toggleBookmark } from "../services/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bookmark, ExternalLink, Calendar, Clock, Video } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

function ContestList() {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState("all")
  const [past, setPast] = useState("false")

  useEffect(() => {
    loadContests()
  }, [platform, past])

  const loadContests = async () => {
    setLoading(true)
    try {
      const platformParam = platform !== "all" ? platform : ""
      const data = await fetchContests(platformParam, past)
      setContests(data)
    } catch (error) {
      console.error("Failed to load contests:", error)
      toast.error("Failed to load contests", {
        description: "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBookmark = async (id) => {
    try {
      await toggleBookmark(id)
      setContests(
        contests.map((contest) => (contest._id === id ? { ...contest, bookmarked: !contest.bookmarked } : contest)),
      )
      toast.success("Bookmark updated", {
        description: "Your bookmark has been updated successfully",
      })
    } catch (error) {
      console.error("Failed to toggle bookmark:", error)
      toast.error("Failed to update bookmark", {
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

  const formatDuration = (duration) => {
    if (!duration || isNaN(duration)) return "Unknown"
    
    // Ensure duration is in minutes
    const minutes = Math.round(duration)
  
    if (minutes < 60) return `${minutes}hrs`
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
  
    return remainingMinutes === 0 ? `${hours}hrs` : `${hours}hrs ${remainingMinutes}m`
  }
  

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs
          defaultValue="upcoming"
          className="w-full sm:w-auto"
          onValueChange={(value) => setPast(value === "past" ? "true" : "false")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="LeetCode">LeetCode</SelectItem>
            <SelectItem value="Codeforces">Codeforces</SelectItem>
            <SelectItem value="CodeChef">CodeChef</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No contests found</h3>
          <p className="text-muted-foreground mt-2">Try changing your filters or check back later</p>
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
                      variant={contest.bookmarked ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleBookmark(contest._id)}
                      className="flex-1"
                    >
                      <Bookmark className={`mr-2 h-4 w-4 ${contest.bookmarked ? "fill-current" : ""}`} />
                      {contest.bookmarked ? "Saved" : "Save"}
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

export default ContestList

