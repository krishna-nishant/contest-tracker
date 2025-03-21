import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ExternalLink, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { toggleBookmark, fetchTodaysContests, fetchContests } from "../services/api";

function TodaysContests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodaysContests = async () => {
      try {
        console.log("Fetching today's contests...");
        const data = await fetchTodaysContests();
        console.log("Today's contests response:", data);
        
        if (data && Array.isArray(data)) {
          setContests(data);
        } else {
          console.log("Invalid response format, falling back to all contests");
          const allContests = await fetchContests();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const todaysContests = allContests.filter(contest => {
            const contestDate = new Date(contest.start_time);
            return contestDate >= today && contestDate < tomorrow;
          });
          
          setContests(todaysContests);
        }
      } catch (error) {
        console.error("❌ Error fetching today's contests:", error);
        toast.error("Failed to load today's contests", {
          description: "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTodaysContests();
  }, []);

  const handleToggleBookmark = async (id) => {
    try {
      await toggleBookmark(id);
      setContests((prevContests) =>
        prevContests.map((contest) =>
          contest._id === id
            ? { ...contest, bookmarked: !contest.bookmarked }
            : contest
        )
      );
      toast.success("Bookmark updated", {
        description: "Your bookmark has been updated successfully",
      });
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      toast.error("Failed to update bookmark", {
        description: "Please try again later",
      });
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case "LeetCode":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Codeforces":
        return "bg-red-500 hover:bg-red-600";
      case "CodeChef":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (duration) => {
    if (!duration || isNaN(duration)) return "Unknown";
    const minutes = Math.round(duration);

    if (minutes < 60) return `${minutes}min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes === 0
      ? `${hours}hrs`
      : `${hours}hrs ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-semibold">Today's Contests</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 flex flex-col justify-between gap-4">
                  <Skeleton className="h-5 w-[250px]" />
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-9 w-[100px]" />
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
          <h3 className="text-lg font-medium">No contests today</h3>
          <p className="text-muted-foreground mt-2">
            Check back later for updates.
          </p>
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
                      <Badge
                        variant="outline"
                        className={`${getPlatformColor(
                          contest.platform
                        )} text-white`}
                      >
                        {contest.platform}
                      </Badge>
                      {contest.duration && (
                        <Badge
                          variant="outline"
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
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
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <a
                        href={contest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
                      <Bookmark
                        className={`mr-2 h-4 w-4 ${
                          contest.bookmarked ? "fill-current" : ""
                        }`}
                      />
                      {contest.bookmarked ? "Saved" : "Save"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link to="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default TodaysContests;
