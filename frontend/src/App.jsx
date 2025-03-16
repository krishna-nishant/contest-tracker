import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import MainNav from "./components/MainNav"
import Home from "./pages/Home"
import Bookmarks from "./pages/Bookmarks"
import SubmitSolution from "./pages/SubmitSolution"
import TodaysContests from "./pages/TodaysContests"


function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <div className="flex min-h-screen flex-col">
          <MainNav />
          <main className="flex-1 container py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/submit-solution" element={<SubmitSolution />} />
              <Route path="/todays-contests" element={<TodaysContests />} />
            </Routes>
          </main>
          <footer className="border-t py-4">
            <div className="container text-center text-sm text-muted-foreground">
              Contest Tracker © {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      </ThemeProvider>
    </Router>
  )
}

export default App

