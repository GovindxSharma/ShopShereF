import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Check,
  Star,
  Layers,
  DollarSign,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { categoryList } from "./FiltersSidebar"

interface FilterSortModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCategory: string
  onCategoryChange: (val: string) => void
  selectedRating: number
  onRatingChange: (val: number) => void
  selectedPrice: number
  onPriceChange: (val: number) => void
  sort: string
  onSortChange: (val: string) => void
  inStockOnly: boolean
  onInStockChange: (val: boolean) => void
  onClear: () => void
  totalCount?: number
}

const sortOptions = [
  { id: "newest", label: "Newest to Latest", desc: "Fresh drops & latest additions" },
  { id: "price-asc", label: "Price: Low to High", desc: "Most affordable options first" },
  { id: "price-desc", label: "Price: High to Low", desc: "Premium & luxury items first" },
  { id: "rating", label: "Top Customer Rated", desc: "Highest star reviews & feedback" },
  { id: "popular", label: "Most Popular", desc: "Customer favorites & bestsellers" },
]

const pricePresets = [
  { label: "All Prices", max: 300000 },
  { label: "Under ₹500", max: 500 },
  { label: "Under ₹1,000", max: 1000 },
  { label: "Under ₹2,000", max: 2000 },
  { label: "Under ₹5,000", max: 5000 },
]

export default function FilterSortModal({
  isOpen,
  onClose,
  selectedCategory,
  onCategoryChange,
  selectedRating,
  onRatingChange,
  selectedPrice,
  onPriceChange,
  sort,
  onSortChange,
  inStockOnly,
  onInStockChange,
  onClear,
  totalCount,
}: FilterSortModalProps) {
  const [sliderPrice, setSliderPrice] = useState(selectedPrice || 300000)

  useEffect(() => {
    setSliderPrice(selectedPrice || 300000)
  }, [selectedPrice])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const hasActive =
    selectedCategory !== "All" ||
    selectedRating > 0 ||
    (selectedPrice > 0 && selectedPrice < 300000) ||
    sort !== "newest" ||
    inStockOnly

  const activeFilterCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedRating > 0 ? 1 : 0) +
    (selectedPrice > 0 && selectedPrice < 300000 ? 1 : 0) +
    (sort !== "newest" ? 1 : 0) +
    (inStockOnly ? 1 : 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide-over Modal Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-card text-card-foreground h-full shadow-2xl border-l border-border/60 flex flex-col z-10 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-border/60 flex items-center justify-between bg-muted/20 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                    Filters & Sorting
                    {activeFilterCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                        {activeFilterCount} Active
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Refine catalog drops by sorting, price, category & ratings
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter & Sort Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7 text-sm">
              {/* 1. Sorting Mode Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-primary" /> Sort Products
                  </span>
                  <span className="text-[11px] font-semibold text-primary">
                    {sortOptions.find((s) => s.id === sort)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {sortOptions.map((opt) => {
                    const isSelected = sort === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onSortChange(opt.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                          isSelected
                            ? "bg-primary/10 border-primary text-foreground shadow-2xs"
                            : "border-border/60 hover:bg-muted/40 text-foreground/80"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs">{opt.label}</p>
                          <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Categories Section */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Categories
                  </span>
                  <span className="text-[11px] font-semibold text-primary">
                    {selectedCategory}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categoryList.map((cat) => {
                    const isSelected =
                      selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
                      (selectedCategory === "All" && cat.id === "All")

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => onCategoryChange(cat.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/30 hover:bg-muted text-foreground/80 border-border/60 hover:border-border"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Price Filter Section */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-primary" /> Maximum Price
                  </span>
                  <span className="font-black text-primary text-xs">
                    {sliderPrice >= 300000 ? "Any Price" : `Up to ₹${sliderPrice.toLocaleString()}`}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {pricePresets.map((preset) => {
                    const isPresetActive =
                      (preset.max === 300000 && (selectedPrice === 0 || selectedPrice === 300000)) ||
                      selectedPrice === preset.max

                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          onPriceChange(preset.max)
                          setSliderPrice(preset.max)
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition text-center ${
                          isPresetActive
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/30 border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>

                {/* Range Slider */}
                <div className="space-y-1.5 pt-2">
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={sliderPrice > 10000 ? 10000 : sliderPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setSliderPrice(val)
                      onPriceChange(val)
                    }}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                    <span>₹100</span>
                    <span>₹5,000</span>
                    <span>₹10,000+</span>
                  </div>
                </div>
              </div>

              {/* 4. Customer Rating Section */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Minimum Rating
                </span>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "All", val: 0 },
                    { label: "4★ & up", val: 4 },
                    { label: "3★ & up", val: 3 },
                    { label: "2★ & up", val: 2 },
                  ].map((r) => {
                    const isSelected = selectedRating === r.val
                    return (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => onRatingChange(r.val)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                            : "bg-muted/30 border-border/60 hover:bg-muted text-foreground/80"
                        }`}
                      >
                        {r.val > 0 && <Star className="w-3 h-3 fill-current" />}
                        {r.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 5. In-Stock Availability Toggle */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-green-500/10 text-green-600">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">In-Stock Only</p>
                      <p className="text-[11px] text-muted-foreground">
                        Hide out of stock items
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onInStockChange(!inStockOnly)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                      inStockOnly ? "bg-green-600" : "bg-muted border border-border"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        inStockOnly ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer: Reset & Apply Button */}
            <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="lg"
                onClick={onClear}
                disabled={!hasActive}
                className="rounded-2xl text-xs font-bold flex items-center gap-1.5 px-4"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>

              <Button
                size="lg"
                onClick={onClose}
                className="flex-1 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2"
              >
                Apply Filters {totalCount !== undefined && `(${totalCount} Products)`}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
