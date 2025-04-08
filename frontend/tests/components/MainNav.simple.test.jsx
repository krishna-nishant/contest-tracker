import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MainNav from "@/components/MainNav";

// Mock the theme provider
vi.mock("@/components/theme-provider", () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn()
  }),
  ThemeProvider: ({ children }) => children
}));

// Mock the UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  )
}));

// Mock the Sheet component
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }) => children,
  SheetContent: ({ children }) => children,
  SheetTrigger: ({ children }) => children
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Menu: () => <span data-testid="icon-menu">MenuIcon</span>,
  X: () => <span data-testid="icon-x">XIcon</span>,
  Home: () => <span data-testid="icon-home">HomeIcon</span>,
  Bookmark: () => <span data-testid="icon-bookmark">BookmarkIcon</span>,
  Calendar: () => <span data-testid="icon-calendar">CalendarIcon</span>,
  Settings: () => <span data-testid="icon-settings">SettingsIcon</span>,
  Github: () => <span data-testid="icon-github">GithubIcon</span>,
  Sun: () => <span data-testid="icon-sun">SunIcon</span>,
  Moon: () => <span data-testid="icon-moon">MoonIcon</span>,
  ChevronUp: () => <span data-testid="icon-chevron-up">ChevronUpIcon</span>,
  ChevronDown: () => <span data-testid="icon-chevron-down">ChevronDownIcon</span>
}));

// Helper function to render MainNav with required providers
const renderMainNav = () => {
  return render(
    <BrowserRouter>
      <MainNav />
    </BrowserRouter>
  );
};

describe("MainNav", () => {
  it("renders the logo and site title", () => {
    renderMainNav();
    // Get the first instance of the logo (desktop view)
    const logos = screen.getAllByText("Contest Tracker");
    expect(logos[0]).toBeInTheDocument();
    expect(logos[0].closest("a")).toHaveAttribute("href", "/");
  });

  it("renders navigation links", () => {
    renderMainNav();
    // Get the first instance of each link (desktop view)
    const homeLinks = screen.getAllByText("Home");
    const bookmarkLinks = screen.getAllByText("Bookmarks");
    expect(homeLinks[0]).toBeInTheDocument();
    expect(bookmarkLinks[0]).toBeInTheDocument();
  });

  it("renders Today's Contests button", () => {
    renderMainNav();
    // Get the first instance of the button (desktop view)
    const buttons = screen.getAllByText("Today's Contests");
    const button = buttons[0];
    expect(button).toBeInTheDocument();
    expect(button.closest("button")).toBeInTheDocument();
  });

  it("renders GitHub link", () => {
    renderMainNav();
    const githubLink = screen.getByLabelText("GitHub repository");
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute("href", "https://github.com/krishna-nishant/contest-tracker");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders mobile menu button", () => {
    renderMainNav();
    const menuButton = screen.getByLabelText("Toggle menu");
    expect(menuButton).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    renderMainNav();
    const themeButton = screen.getByLabelText("Toggle theme");
    expect(themeButton).toBeInTheDocument();
  });
}); 