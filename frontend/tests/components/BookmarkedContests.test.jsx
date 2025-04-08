import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BookmarkedContests from "@/components/BookmarkedContests";

// Mock the API
vi.mock("@/services/api", () => ({
  fetchBookmarkedContests: vi.fn().mockResolvedValue([
    {
      _id: "1",
      title: "Contest 1",
      platform: "Codeforces",
      start_time: "2024-03-20T10:00:00Z",
      duration: 120,
      url: "https://codeforces.com/contest/1"
    },
    {
      _id: "2",
      title: "Contest 2",
      platform: "LeetCode",
      start_time: "2024-03-21T15:30:00Z",
      duration: 90,
      url: "https://leetcode.com/contest/2"
    }
  ]),
  toggleBookmark: vi.fn()
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock the UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }) => <div className={className}>{children}</div>
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, variant, size, asChild, ...props }) => (
    <button 
      onClick={onClick} 
      className={className} 
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {asChild ? children : <>{children}</>}
    </button>
  )
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, variant }) => (
    <div 
      className={className}
      data-variant={variant}
    >
      {children}
    </div>
  )
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Bookmark: () => <span data-testid="icon-bookmark">BookmarkIcon</span>,
  ExternalLink: () => <span data-testid="icon-external-link">ExternalLinkIcon</span>,
  Clock: () => <span data-testid="icon-clock">ClockIcon</span>,
  Video: () => <span data-testid="icon-video">VideoIcon</span>
}));

const renderBookmarkedContests = () => {
  return render(
    <BrowserRouter>
      <BookmarkedContests />
    </BrowserRouter>
  );
};

describe("BookmarkedContests Component", () => {
  it("renders bookmarked contests", async () => {
    renderBookmarkedContests();
    expect(await screen.findByText("Contest 1")).toBeInTheDocument();
    expect(await screen.findByText("Contest 2")).toBeInTheDocument();
  });

  it("shows platform badges", async () => {
    renderBookmarkedContests();
    expect(await screen.findByText("Codeforces")).toBeInTheDocument();
    expect(await screen.findByText("LeetCode")).toBeInTheDocument();
  });

  it("allows removing bookmarks", async () => {
    const { toggleBookmark } = await import("@/services/api");
    renderBookmarkedContests();

    const removeButtons = await screen.findAllByText("Remove");
    fireEvent.click(removeButtons[0]);

    expect(toggleBookmark).toHaveBeenCalledWith("1");
  });

  it("displays contest durations", async () => {
    renderBookmarkedContests();
    expect(await screen.findByText("2hrs")).toBeInTheDocument();
    expect(await screen.findByText("1hrs 30m")).toBeInTheDocument();
  });

  it("provides links to contests", async () => {
    renderBookmarkedContests();
    const visitButtons = await screen.findAllByText("Visit");
    
    expect(visitButtons[0].closest("a")).toHaveAttribute("href", "https://codeforces.com/contest/1");
    expect(visitButtons[1].closest("a")).toHaveAttribute("href", "https://leetcode.com/contest/2");
  });
}); 