import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SubmitSolutionForm from "@/components/SubmitSolutionForm";

// Mock the API
vi.mock("@/services/api", () => ({
  fetchPastContests: vi.fn().mockResolvedValue([
    { _id: "1", title: "Contest 1", platform: "Codeforces" },
    { _id: "2", title: "Contest 2", platform: "LeetCode" }
  ]),
  addSolutionLink: vi.fn().mockResolvedValue({ success: true })
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
  Card: ({ children }) => <div>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <div>{children}</div>,
  CardDescription: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardFooter: ({ children }) => <div>{children}</div>
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, ...props }) => (
    <button disabled={disabled} data-testid="submit-button" {...props}>{children}</button>
  )
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ ...props }) => (
    <input data-testid="solution-input" {...props} />
  )
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }) => <div data-testid="select-contest">{children}</div>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <div data-value={value}>{children}</div>
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Video: () => <span data-testid="icon-video">VideoIcon</span>,
  Link2: () => <span data-testid="icon-link">LinkIcon</span>
}));

const renderSubmitSolutionForm = () => {
  return render(
    <BrowserRouter>
      <SubmitSolutionForm />
    </BrowserRouter>
  );
};

describe("SubmitSolutionForm Component", () => {
  it("renders the form with title", () => {
    renderSubmitSolutionForm();
    expect(screen.getByText("Submit YouTube Solution")).toBeInTheDocument();
    expect(screen.getByText("Share your video solution to help others learn")).toBeInTheDocument();
  });

  it("renders contest selection", () => {
    renderSubmitSolutionForm();
    expect(screen.getByTestId("select-contest")).toBeInTheDocument();
    expect(screen.getByText("Select Contest")).toBeInTheDocument();
  });

  it("renders solution input", () => {
    renderSubmitSolutionForm();
    expect(screen.getByTestId("solution-input")).toBeInTheDocument();
    expect(screen.getByText("YouTube Solution Link")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderSubmitSolutionForm();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    expect(screen.getByText("Submit Solution")).toBeInTheDocument();
  });
});
