import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { ArrowUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Robust ScrollToTop component:
 * 1. Resets scroll to (0, 0) on every route/search change across all browsers and containers.
 * 2. Provides a sleek floating "Back to Top" button for long pages and dashboards.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation()
  const [showButton, setShowButton] = useState(false)

  // Force scroll to top on every route navigation
  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0)
      if (document.documentElement) document.documentElement.scrollTop = 0
      if (document.body) document.body.scrollTop = 0
      const root = document.getElementById("root")
      if (root) root.scrollTop = 0
    }

    // Instant reset
    resetScroll()

    // Secondary reset after render cycle
    const rafId = requestAnimationFrame(resetScroll)
    const timerId = setTimeout(resetScroll, 20)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timerId)
    }
  }, [pathname, search])

  // Track scroll position for floating back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0

      if (currentScroll > 280) {
        setShowButton(true)
      } else {
        setShowButton(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <AnimatePresence>
      {showButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:left-6 sm:right-auto z-40 p-2.5 sm:p-3 rounded-full bg-card/90 hover:bg-card border border-border/70 text-foreground shadow-lg backdrop-blur-md hover:scale-105 active:scale-95 transition flex items-center justify-center group"
          title="Scroll to Top"
          aria-label="Scroll to top of page"
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-foreground group-hover:text-primary transition-colors" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
