import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import "keen-slider/keen-slider.min.css"

import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "sonner"
import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "@/redux/store"
import { GoogleOAuthProvider } from "@react-oauth/google"

// Load from .env
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Detect mobile (you can tweak the breakpoint)
const isMobile = window.innerWidth < 640

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Toaster
              richColors
              position={isMobile ? "top-center" : "top-right"}
              duration={2000}
            />
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
)
