import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Github, Menu } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function MainNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo - Always visible */}
        <div className="flex mr-auto">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="font-bold">Contest Tracker</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium mx-6">
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
        </div>

        <div className="flex items-center gap-2">
          {/* Today's Contests Button - Desktop */}
          <Link to="/todays-contests" className="hidden md:block">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Today's Contests
            </Button>
          </Link>

          {/* Theme toggle button */}
          <ModeToggle />

          {/* GitHub Repo Link - Desktop and Mobile */}
          <a
            href="https://github.com/krishna-nishant/contest-tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block"
            aria-label="GitHub repository"
          >
            <Button variant="outline" size="sm">
              <Github className="h-5 w-5" />
            </Button>
          </a>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-6 py-4">
                <Link to="/" className="flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="font-bold">Contest Tracker</span>
                </Link>
                
                <nav className="flex flex-col gap-4">
                  <Link
                    to="/"
                    className={cn(
                      "flex items-center text-lg font-medium transition-colors hover:text-foreground/80",
                      pathname === "/" ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    Home
                  </Link>
                  <Link
                    to="/bookmarks"
                    className={cn(
                      "flex items-center text-lg font-medium transition-colors hover:text-foreground/80",
                      pathname === "/bookmarks" ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    Bookmarks
                  </Link>
                  <Link
                    to="/todays-contests"
                    className={cn(
                      "flex items-center text-lg font-medium transition-colors hover:text-foreground/80",
                      pathname === "/todays-contests" ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Today's Contests
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default MainNav;
