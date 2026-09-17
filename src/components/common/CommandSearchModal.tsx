// src/components/common/CommandSearchModal.tsx
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag,
  Star,
  CornerDownLeft,
} from "lucide-react"
import Fuse from "fuse.js"
import type { Product } from "@/types/product"

// ⚡ In-Memory Singleton Catalog Cache for 0ms Zero-Latency Instant Search
let catalogCache: Product[] | null = null

interface CommandSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const QUICK_CATEGORIES = [
  { name: "T-Shirts", label: "Oversized Tees", param: "T-Shirts" },
  { name: "Shoes", label: "Street Kicks", param: "Shoes" },
  { name: "Pants", label: "Utility Cargo", param: "Pants" },
  { name: "Bags", label: "EDC Gear", param: "Bags" },
  { name: "Accessories", label: "VIP Watches", param: "Accessories" },
]

const POPULAR_SEARCHES = [
  "Heavyweight Oversized Tee",
  "Cloud-Foam High-Tops",
  "Waterproof Tactical Cargo",
  "Weatherproof Backpack",
  "Precision Chronograph",
]

export default function CommandSearchModal({
  isOpen,
  onClose,
}: CommandSearchModalProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>(catalogCache || [])
  const [results, setResults] = useState<Product[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  // 1. Fetch / Cache Catalog Data on Mount or First Open
  useEffect(() => {
    if (!isOpen) return

    const fetchCatalog = async () => {
      if (catalogCache && catalogCache.length > 0) {
        setProducts(catalogCache)
        return
      }

      try {
        setLoading(true)
        const API_BASE = import.meta.env.VITE_API_BASE_URL
        const res = await fetch(`${API_BASE}/products/all`)
        const data = await res.json()
        const fetched = data.products || []
        catalogCache = fetched
        setProducts(fetched)
      } catch (err) {
        console.error("Failed to load catalog for instant search:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCatalog()
  }, [isOpen])

  // 2. Autofocus & Reset State on Open
  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // 3. Instant Fuzzy Search using Fuse.js
  useEffect(() => {
    if (!query.trim() || products.length === 0) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const fuse = new Fuse(products, {
      keys: [
        { name: "name", weight: 0.6 },
        { name: "category", weight: 0.3 },
        { name: "description", weight: 0.1 },
      ],
      threshold: 0.35,
    })

    const matches = fuse.search(query.trim()).map((match) => match.item)
    setResults(matches)
    setSelectedIndex(0)
  }, [query, products])

  // 4. Keyboard Navigation (Arrow Keys, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % Math.min(results.length, 6))
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (results.length > 0) {
        const maxLen = Math.min(results.length, 6)
        setSelectedIndex((prev) => (prev - 1 + maxLen) % maxLen)
      }
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results.length > 0 && results[selectedIndex]) {
        navigate(`/products/${results[selectedIndex]._id}`)
        onClose()
      } else if (query.trim()) {
        navigate(`/products?search=${encodeURIComponent(query.trim())}`)
        onClose()
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    }
  }

  // 5. Outside Click Handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-md flex flex-col justify-start sm:justify-start pt-0 sm:pt-16 lg:pt-20 px-0 sm:px-4"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="w-full sm:max-w-2xl bg-card border-b sm:border border-border/80 sm:rounded-3xl shadow-2xl flex flex-col max-h-screen sm:max-h-[600px] overflow-hidden backdrop-blur-2xl"
        >
          {/* Header Search Input Bar */}
          <div className="flex items-center gap-3 p-3.5 sm:p-4 border-b border-border/60 bg-muted/20">
            <Search className="w-5 h-5 text-muted-foreground shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search streetwear, tees, kicks, cargo, bags..."
              aria-label="Search catalog"
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />

            {/* Quick Clear or Cancel */}
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  inputRef.current?.focus()
                }}
                aria-label="Clear query"
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}

            {/* Mobile Explicit Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden text-xs font-bold text-primary px-2 py-1"
            >
              Cancel
            </button>

            {/* Desktop ESC hint badge */}
            <kbd className="hidden sm:inline-flex font-mono text-[10px] font-bold px-2 py-1 rounded-md bg-muted border border-border/70 text-muted-foreground shadow-2xs">
              ESC
            </kbd>
          </div>

          {/* Results Container / Zero-State Container */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4">
            {/* Loading Indicator */}
            {loading && products.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground">Indexing catalog drops...</p>
              </div>
            )}

            {/* Zero-Query State: Instant Discover Suggestions */}
            {!query.trim() && !loading && (
              <div className="space-y-4 py-2">
                {/* Popular Categories */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-primary" /> Browse Curated Departments
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_CATEGORIES.map((cat) => (
                      <button
                        key={cat.param}
                        type="button"
                        onClick={() => {
                          navigate(`/products?category=${cat.param}`)
                          onClose()
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground border border-border/60 hover:border-border transition active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Searches */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-amber-500" /> Trending Searches
                  </span>
                  <div className="flex flex-col gap-1">
                    {POPULAR_SEARCHES.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setQuery(item)}
                        className="flex items-center justify-between p-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition cursor-pointer text-left"
                      >
                        <span className="flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-muted-foreground/60" />
                          <span>{item}</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-50" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results List */}
            {query.trim() && !loading && (
              <>
                {results.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="text-sm font-bold text-foreground">
                      No matching products for "{query}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px]">Enter</kbd> to search the full catalog
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/products?search=${encodeURIComponent(query.trim())}`)
                        onClose()
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-sm active:scale-95 transition"
                    >
                      Search All Catalog <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground px-1 block">
                      Matches ({results.length})
                    </span>
                    {results.slice(0, 6).map((product, idx) => {
                      const isSelected = idx === selectedIndex

                      return (
                        <div
                          key={product._id}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={() => {
                            navigate(`/products/${product._id}`)
                            onClose()
                          }}
                          className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition cursor-pointer group ${
                            isSelected
                              ? "bg-primary/10 border border-primary/30 shadow-2xs"
                              : "hover:bg-muted/40 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                product.images?.[0]?.url ||
                                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop"
                              }
                              alt={product.name}
                              width="48"
                              height="48"
                              loading="lazy"
                              className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-xl bg-muted/30 p-1 shrink-0 group-hover:scale-105 transition"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                <span className="font-medium">{product.category}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                  <Star className="w-3 h-3 fill-current" /> {product.ratings || 5}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-3 flex items-center gap-2">
                            <p className="text-xs sm:text-sm font-black text-foreground">
                              ₹{product.price.toLocaleString()}
                            </p>
                            {isSelected && (
                              <CornerDownLeft className="hidden sm:inline w-3.5 h-3.5 text-primary opacity-80" />
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Full Search Action Footer Item */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/products?search=${encodeURIComponent(query.trim())}`)
                        onClose()
                      }}
                      className="w-full mt-2 flex items-center justify-between p-3 rounded-2xl bg-muted/40 hover:bg-muted text-xs font-bold text-primary transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5" />
                        <span>See all catalog results for "{query}"</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Desktop Footer Shortcuts */}
          <div className="hidden sm:flex items-center justify-between px-4 py-2.5 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/80 font-mono text-[10px] font-bold">
                  ↑↓
                </kbd>{" "}
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/80 font-mono text-[10px] font-bold">
                  ↵
                </kbd>{" "}
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/80 font-mono text-[10px] font-bold">
                  esc
                </kbd>{" "}
                close
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground/80">
              0ms Instant Fuzzy Search
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
