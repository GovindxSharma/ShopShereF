// src/components/common/CommandSearchModal.tsx
import { useEffect, useRef, useState, useCallback } from "react"
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
  Flame,
  Zap,
} from "lucide-react"
import Fuse from "fuse.js"
import type { Product } from "@/types/product"
import { getOptimizedImageUrl } from "@/utils/imageOptimizer"

// ⚡ In-Memory Singleton Catalog Cache for 0ms Instant Fuzzy Search
let catalogCache: Product[] | null = null

interface CommandSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const QUICK_CATEGORIES = [
  { name: "T-Shirts", label: "Oversized Tees", param: "T-Shirts", icon: "👕" },
  { name: "Shoes", label: "Street Kicks", param: "Shoes", icon: "👟" },
  { name: "Pants", label: "Utility Cargo", param: "Pants", icon: "👖" },
  { name: "Bags", label: "EDC Gear", param: "Bags", icon: "🎒" },
  { name: "Accessories", label: "VIP Watches", param: "Accessories", icon: "⌚" },
]

const POPULAR_SEARCHES = [
  { term: "Heavyweight Oversized Tee", rank: 1, tag: "Hot Drop" },
  { term: "Cloud-Foam High-Tops", rank: 2, tag: "Trending" },
  { term: "Waterproof Tactical Cargo", rank: 3, tag: "Utility" },
  { term: "Weatherproof Backpack", rank: 4, tag: "EDC" },
  { term: "Precision Chronograph", rank: 5, tag: "Luxury" },
]

export default function CommandSearchModal({
  isOpen,
  onClose,
}: CommandSearchModalProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<Product[]>(catalogCache || [])
  const [results, setResults] = useState<Product[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  // 1. Fetch / Cache Catalog Data on First Open
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

  // 2. Autofocus, Scroll Lock & Reset State on Open/Close
  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
      const timer = setTimeout(() => inputRef.current?.focus(), 60)
      document.body.style.overflow = "hidden"
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = "unset"
      }
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // 3. Instant Fuzzy Search via Fuse.js
  useEffect(() => {
    if (!query.trim() || products.length === 0) {
      setResults([])
      setSelectedIndex(0)
      return
    }

    const fuse = new Fuse(products, {
      keys: [
        { name: "name", weight: 0.6 },
        { name: "category", weight: 0.25 },
        { name: "description", weight: 0.15 },
      ],
      threshold: 0.35,
    })

    const matches = fuse.search(query.trim()).map((match) => match.item)
    setResults(matches)
    setSelectedIndex(0)
  }, [query, products])

  // 4. Scroll Selected Item into View for Keyboard Nav
  useEffect(() => {
    if (results.length > 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      })
    }
  }, [selectedIndex, results.length])

  // 5. Navigate to Product
  const handleSelectProduct = useCallback(
    (product: Product) => {
      navigate(`/products/${product._id}`)
      onClose()
    },
    [navigate, onClose]
  )

  // 6. Navigate to Full Search Results
  const handleFullSearch = useCallback(
    (searchQuery?: string) => {
      const q = searchQuery ?? query
      if (q.trim()) {
        navigate(`/products?search=${encodeURIComponent(q.trim())}`)
        onClose()
      }
    },
    [navigate, onClose, query]
  )

  // 7. Keyboard Navigation (Arrow Keys, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const maxItems = Math.min(results.length, 8)

    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (maxItems > 0) {
        setSelectedIndex((prev) => (prev + 1) % maxItems)
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (maxItems > 0) {
        setSelectedIndex((prev) => (prev - 1 + maxItems) % maxItems)
      }
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results.length > 0 && results[selectedIndex]) {
        handleSelectProduct(results[selectedIndex])
      } else if (query.trim()) {
        handleFullSearch()
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    }
  }

  // 8. Outside Click Handler
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product Search Modal"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8"
        >
          <motion.div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-card text-card-foreground border border-border/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[640px] overflow-hidden backdrop-blur-2xl ring-1 ring-white/10 dark:ring-white/5"
          >
            {/* Ambient Decorative Lighting */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Search Input Bar */}
            <div className="relative flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3.5 sm:py-4 border-b border-border/70 bg-muted/20">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform">
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search streetwear, tees, kicks, cargo, bags..."
                aria-label="Search catalog"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />

              {/* Quick Clear Button */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    inputRef.current?.focus()
                  }}
                  aria-label="Clear search input"
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Close Button / Shortcut Badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                <kbd className="hidden sm:inline-flex font-mono text-[10px] font-bold px-2 py-1 rounded-md bg-muted border border-border/70 text-muted-foreground shadow-2xs">
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Results Container / Zero-State Content */}
            <div
              ref={resultsContainerRef}
              className="relative flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20"
            >
              {/* Loading State */}
              {loading && products.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Indexing high-speed catalog drops...
                  </p>
                </div>
              )}

              {/* Zero-Query State: Instant Discover Suggestions */}
              {!query.trim() && !loading && (
                <div className="space-y-5 py-1">
                  {/* Curated Categories */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-primary" /> Curated Departments
                      </span>
                      <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
                        Instant browse
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_CATEGORIES.map((cat) => (
                        <button
                          key={cat.param}
                          type="button"
                          onClick={() => {
                            navigate(`/products?category=${cat.param}`)
                            onClose()
                          }}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold bg-muted/50 hover:bg-primary/10 hover:border-primary/40 text-foreground border border-border/70 transition-all hover:scale-102 active:scale-95 cursor-pointer shadow-2xs"
                        >
                          <span className="text-sm">{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trending Searches */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-amber-500" /> Trending Searches
                      </span>
                      <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-500" /> Live Popularity
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {POPULAR_SEARCHES.map((item) => (
                        <button
                          key={item.term}
                          type="button"
                          onClick={() => setQuery(item.term)}
                          className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer text-left border border-transparent hover:border-border/50 group"
                        >
                          <span className="flex items-center gap-2.5 truncate">
                            <span className="w-4 text-[10px] font-black text-muted-foreground/50 group-hover:text-primary">
                              #{item.rank}
                            </span>
                            <span className="truncate">{item.term}</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition shrink-0 ml-2 font-mono">
                            {item.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Highlight Feature Card */}
                  <div className="p-3.5 rounded-2xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Zero-Latency Instant Search
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Type any keyword, brand or color for real-time fuzzy matching.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFullSearch("")}
                      className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Browse All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Results List */}
              {query.trim() && !loading && (
                <>
                  {results.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                        <Search className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          No instant matches for &ldquo;{query}&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Try searching by general category, tag, or browse the entire catalog.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFullSearch(query)}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition cursor-pointer"
                      >
                        Search All Catalog <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1 mb-2">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                          Matching Products ({results.length})
                        </span>
                        <span className="text-[10px] text-muted-foreground/70 hidden sm:inline font-mono">
                          Use ↑↓ to navigate • ↵ to open
                        </span>
                      </div>

                      {results.slice(0, 8).map((product, idx) => {
                        const isSelected = idx === selectedIndex
                        const imageUrl = getOptimizedImageUrl(
                          product.images?.[0]?.url,
                          120
                        )

                        return (
                          <div
                            key={product._id}
                            ref={(el) => {
                              itemRefs.current[idx] = el
                            }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            onClick={() => handleSelectProduct(product)}
                            className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer group ${
                              isSelected
                                ? "bg-primary/10 border border-primary/40 shadow-xs translate-x-0.5"
                                : "hover:bg-muted/50 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-muted/40 p-1 shrink-0 flex items-center justify-center overflow-hidden border border-border/50">
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  width="48"
                                  height="48"
                                  loading="lazy"
                                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                  {product.name}
                                </p>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                  <span className="font-medium bg-muted/60 px-1.5 py-0.2 rounded text-[10px]">
                                    {product.category}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                                    <Star className="w-3 h-3 fill-current" />{" "}
                                    {product.ratings || 5}
                                  </span>
                                  {product.stock && product.stock < 5 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-[10px] text-amber-500 font-semibold">
                                        Only {product.stock} left
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0 pl-3 flex items-center gap-2.5">
                              <div>
                                <p className="text-xs sm:text-sm font-black text-foreground">
                                  ₹{product.price.toLocaleString()}
                                </p>
                              </div>
                              {isSelected && (
                                <CornerDownLeft className="hidden sm:inline w-4 h-4 text-primary opacity-80" />
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {/* Full Catalog Action Footer Item */}
                      <button
                        type="button"
                        onClick={() => handleFullSearch(query)}
                        className="w-full mt-3 flex items-center justify-between p-3 rounded-2xl bg-muted/40 hover:bg-muted text-xs font-bold text-primary transition cursor-pointer border border-border/60 hover:border-border"
                      >
                        <span className="flex items-center gap-2">
                          <Search className="w-3.5 h-3.5" />
                          <span>View all results for &ldquo;{query}&rdquo;</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Desktop & Mobile Responsive Footer Bar */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-t border-border/70 bg-muted/20 text-xs text-muted-foreground">
              {/* Keyboard Shortcuts on Desktop */}
              <div className="hidden sm:flex items-center gap-3.5">
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

              {/* Mobile Quick Info */}
              <div className="sm:hidden flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Tap any drop to view details</span>
              </div>

              <span className="text-[11px] font-mono text-muted-foreground/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                0ms Instant Search
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
