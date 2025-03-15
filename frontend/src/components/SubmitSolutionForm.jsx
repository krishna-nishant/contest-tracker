"use client"

import { useState, useEffect } from "react"
import { fetchPastContests, addSolutionLink } from "../services/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Video, Link2 } from "lucide-react"
import { toast } from "sonner"

function SubmitSolutionForm() {
  const [contests, setContests] = useState([])
  const [selectedContest, setSelectedContest] = useState("")
  const [solutionLink, setSolutionLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadPastContests()
  }, [])

  const loadPastContests = async () => {
    setLoading(true)
    try {
      const data = await fetchPastContests()
      setContests(data)
    } catch (error) {
      console.error("Failed to load past contests:", error)
      toast.error("Failed to load past contests", {
        description: "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedContest) {
      toast.error("Missing contest", {
        description: "Please select a contest",
      })
      return
    }

    if (!solutionLink.startsWith("https://")) {
      toast.error("Invalid link", {
        description: "Please enter a valid URL starting with https://",
      })
      return
    }

    setSubmitting(true)
    try {
      await addSolutionLink(selectedContest, solutionLink)
      toast.success("Solution submitted", {
        description: "Your solution link has been added successfully",
      })
      setSolutionLink("")
      setSelectedContest("")
    } catch (error) {
      console.error("Failed to submit solution:", error)
      toast.error("Failed to submit solution", {
        description: "Please try again later",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Submit YouTube Solution
        </CardTitle>
        <CardDescription>Share your video solution to help others learn</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="contest"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select Contest
            </label>
            <Select value={selectedContest} onValueChange={setSelectedContest} disabled={loading || submitting}>
              <SelectTrigger id="contest" className="w-full">
                <SelectValue placeholder="Select a past contest" />
              </SelectTrigger>
              <SelectContent>
                {contests.length === 0 ? (
                  <SelectItem value="loading" disabled>
                    {loading ? "Loading contests..." : "No contests available"}
                  </SelectItem>
                ) : (
                  contests.map((contest) => (
                    <SelectItem key={contest._id} value={contest._id}>
                      {contest.title || "Untitled"} ({contest.platform})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="solution-link"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              YouTube Solution Link
            </label>
            <div className="flex items-center space-x-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <Input
                id="solution-link"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={solutionLink}
                onChange={(e) => setSolutionLink(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading || submitting}>
            {submitting ? "Submitting..." : "Submit Solution"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default SubmitSolutionForm

