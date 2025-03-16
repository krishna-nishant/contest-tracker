import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, Bookmark, Video } from "lucide-react"
import { ModeToggle } from "./ModeToggle"

function MainNav() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Contest Tracker</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Home
            </Link>
            <Link
              to="/bookmarks"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/bookmarks" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Bookmarks
            </Link>
            <Link
              to="/submit-solution"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/submit-solution" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Submit Solution
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button variant="outline" size="sm" className="ml-auto hidden md:flex">
              <Calendar className="mr-2 h-4 w-4" />
              Today's Contests
            </Button>
          </div>

          {/* Theme toggle button */}
          <ModeToggle />

          <nav className="flex items-center md:hidden">
            <Link
              to="/"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md",
                pathname === "/" ? "bg-accent" : "bg-transparent",
              )}
            >
              <Calendar className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Link>
            <Link
              to="/bookmarks"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md",
                pathname === "/bookmarks" ? "bg-accent" : "bg-transparent",
              )}
            >
              <Bookmark className="h-5 w-5" />
              <span className="sr-only">Bookmarks</span>
            </Link>
            <Link
              to="/submit-solution"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md",
                pathname === "/submit-solution" ? "bg-accent" : "bg-transparent",
              )}
            >
              <Video className="h-5 w-5" />
              <span className="sr-only">Submit Solution</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default MainNav

