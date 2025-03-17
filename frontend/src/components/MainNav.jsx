import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Github } from "lucide-react";
import { ModeToggle } from "./ModeToggle";

function MainNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Contest Tracker
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={cn(
                "hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Home
            </Link>
            <Link
              to="/bookmarks"
              className={cn(
                "hover:text-foreground/80",
                pathname === "/bookmarks"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Bookmarks
            </Link>
            <Link
              to="/submit-solution"
              className={cn(
                "hover:text-foreground/80",
                pathname === "/submit-solution"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Submit Solution
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* New Button to Today's Contests Page */}
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link to="/todays-contests">
              <Button
                variant="outline"
                size="sm"
                className="ml-auto hidden md:flex"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Today's Contests
              </Button>
            </Link>
          </div>

          {/* Theme toggle button */}
          <ModeToggle />

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/krishna-nishant/contest-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2"
          >
            <Button variant="outline" size="sm">
              <Github className="h-5 w-5" />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}

export default MainNav;
