import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "./components/theme-provider"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <App />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </React.StrictMode>,
)

