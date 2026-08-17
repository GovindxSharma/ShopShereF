import { useEffect, useRef, useState } from "react"
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  Star,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  selectedCategory: string
  onCategoryChange: (val: string) => void
  selectedRating: number
  onRatingChange: (val: number) => void
  selectedPrice: number
  onPriceChange: (val: number) => void
  inStockOnly?: boolean
  onInStockChange?: (val: boolean) => void
  onClear: () => void
  totalCount?: number
}

export const categoryList = [
  { id: "All", name: "All Categories" },
  { id: "T-Shirts", name: "T-Shirts" },
  { id: "Pants", name: "Pants & Trousers" },
  { id: "Shoes", name: "Footwear & Shoes" },
  { id: "Bags", name: "Bags & Backpacks" },
  { id: "Accessories", name: "Accessories" },
  { id: "Electronics", name: "Electronics" },
  { id: "Audio", name: "Audio" },
  { id: "Laptops", name: "Laptops" },
  { id: "Watches", name: "Watches" },
  { id: "Fashion", name: "Apparel & Fashion" },
]

const pricePresets = [
  { label: "All Prices", max: 300000 },
  { label: "Under ₹500", max: 500 },
  { label: "Under ₹1,000", max: 1000 },
  { label: "Under ₹2,000", max: 2000 },
  { label: "Under ₹5,000", max: 5000 },
]

export default function FiltersSidebar({
  selectedCategory,
  onCategoryChange,
  selectedRating,
  onRatingChange,
  selectedPrice,
  onPriceChange,
  inStockOnly = false,
  onInStockChange,
  onClear,
  totalCount,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sliderPrice, setSliderPrice] = useState(selectedPrice || 300000)
  const mobileRef = useRef<HTMLDivElement>(null)

  const [catOpen, setCatOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)
  const [ratingOpen, setRatingOpen] = useState(true)

  useEffect(() => {
    setSliderPrice(selectedPrice || 300000)
  }, [selectedPrice])

  useEffect(() => {
    if (!mobileOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [mobileOpen])

  const hasActive =
    selectedCategory !== "All" ||
    selectedRating > 0 ||
    (selectedPrice > 0 && selectedPrice < 300000) ||
    inStockOnly

  const renderContent = () => (
    <div className="space-y-6 text-sm">
      {/* 1. Categories Accordion */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setCatOpen(!catOpen)}
          className="w-full flex items-center justify-between font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-primary" /> Categories
          </span>
          {catOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {catOpen && (
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {categoryList.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
                (selectedCategory === "All" && cat.id === "All")

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "hover:bg-muted text-foreground/80 hover:text-foreground font-medium"
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. Price Budget Accordion */}
      <div className="space-y-3 border-t border-border/50 pt-4">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
        >
          <span>Price Budget</span>
          {priceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {priceOpen && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {pricePresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    onPriceChange(preset.max)
                    setSliderPrice(preset.max)
                  }}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition ${
                    selectedPrice === preset.max ||
                    (preset.max === 300000 && (!selectedPrice || selectedPrice === 300000))
                      ? "bg-primary/10 border-primary text-primary font-semibold"
                      : "bg-muted/30 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Maximum:</span>
                <span className="text-primary font-bold">
                  {sliderPrice < 300000 ? `₹${sliderPrice.toLocaleString()}` : "All Prices"}
                </span>
              </div>
              <input
                type="range"
                min={300}
                max={300000}
                step={500}
                value={sliderPrice}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setSliderPrice(val)
                  onPriceChange(val)
                }}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Rating Accordion */}
      <div className="space-y-3 border-t border-border/50 pt-4">
        <button
          type="button"
          onClick={() => setRatingOpen(!ratingOpen)}
          className="w-full flex items-center justify-between font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition"
        >
          <span>Customer Rating</span>
          {ratingOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {ratingOpen && (
          <div className="space-y-1">
            {[4, 3, 2, 1].map((stars) => {
              const isSelected = selectedRating === stars

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => onRatingChange(isSelected ? 0 : stars)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition ${
                    isSelected
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30"
                      : "hover:bg-muted text-foreground/80"
                  }`}
                >
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < stars
                            ? "fill-amber-500 stroke-amber-500"
                            : "stroke-gray-300 dark:stroke-gray-600"
                        }`}
                      />
                    ))}
                    <span className="ml-1.5 text-xs text-foreground font-medium">
                      {stars} Stars & Above
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Availability Filter */}
      {onInStockChange && (
        <div className="border-t border-border/50 pt-4 flex items-center justify-between">
          <label
            htmlFor="in-stock-toggle"
            className="text-xs font-medium text-foreground cursor-pointer"
          >
            In Stock Only
          </label>
          <input
            id="in-stock-toggle"
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="w-4 h-4 rounded-md accent-primary cursor-pointer"
          />
        </div>
      )}

      {/* Reset Filter Action */}
      {hasActive && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="w-full rounded-xl text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition mt-2 flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Trigger */}
      <div className="md:hidden flex justify-between items-center gap-3 w-full">
        <Button
          variant="outline"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-xl text-xs font-semibold py-2 px-3.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
          Filter Catalog
          {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 bg-card border border-border/60 rounded-2xl p-5 shadow-xs sticky top-24">
        <div className="flex justify-between items-center border-b border-border/50 pb-3 mb-4">
          <div>
            <h2 className="font-bold text-sm text-foreground">Filters</h2>
            {totalCount !== undefined && (
              <p className="text-[11px] text-muted-foreground">{totalCount} items</p>
            )}
          </div>

          {hasActive && (
            <button
              onClick={onClear}
              className="text-[11px] text-muted-foreground hover:text-red-500 font-medium flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {renderContent()}
      </aside>

      {/* Mobile Modal */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div
            ref={mobileRef}
            className="w-full max-w-xs bg-background p-6 space-y-6 overflow-y-auto h-full shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-sm">Filter Products</h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderContent()}
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-xl text-xs font-semibold"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
