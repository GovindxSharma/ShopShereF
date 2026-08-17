import { useEffect, useMemo, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchProducts } from "@/redux/slices/productSlice"
import ProductCard from "@/components/products/ProductCard"
import FilterSortModal from "@/components/products/FilterSortModal"
import { categoryList } from "@/components/products/FiltersSidebar"
import Loader from "@/components/common/Loader"
import { useSearchParams, useNavigate } from "react-router-dom"
import {
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  LayoutGrid,
  Grid3X3,
  ListFilter,
  Sparkles,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sortLabels: Record<string, string> = {
  newest: "Newest to Latest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
  popular: "Most Popular",
}

export default function ProductsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { products, total, loading, error } = useAppSelector(
    (state) => state.products
  )

  const [category, setCategory] = useState("All")
  const [rating, setRating] = useState(0)
  const [price, setPrice] = useState(0)
  const [sort, setSort] = useState("newest")
  const [inStockOnly, setInStockOnly] = useState(false)
  const [gridColumns, setGridColumns] = useState<3 | 4>(4)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const PRODUCTS_PER_PAGE = 12

  const [searchParams] = useSearchParams()
  const searchQuery = useMemo(() => searchParams.get("search") || "", [searchParams])

  useEffect(() => {
    setPage(1)
  }, [category, rating, price, searchQuery, sort, inStockOnly])

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(
        fetchProducts({
          category,
          ratings: rating,
          price: price === 300000 ? 0 : price,
          page,
          limit: PRODUCTS_PER_PAGE,
          keyword: searchQuery,
          sort,
        })
      )
    }, 150)

    return () => clearTimeout(timeout)
  }, [dispatch, category, rating, price, page, searchQuery, sort])

  const displayedProducts = useMemo(() => {
    if (!inStockOnly) return products
    return products.filter((p) => (p.stock || 0) > 0)
  }, [products, inStockOnly])

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE) || 1

  const resetFilters = () => {
    setCategory("All")
    setRating(0)
    setPrice(0)
    setSort("newest")
    setInStockOnly(false)
    setPage(1)
    if (searchQuery) {
      navigate("/products")
    }
  }

  const activeFilterCount =
    (category !== "All" ? 1 : 0) +
    (rating > 0 ? 1 : 0) +
    (price > 0 && price < 300000 ? 1 : 0) +
    (sort !== "newest" ? 1 : 0) +
    (inStockOnly ? 1 : 0)

  const hasActiveFilters = activeFilterCount > 0 || Boolean(searchQuery)

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 min-h-[80vh]">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-border/60 pb-4 sm:pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3" /> Catalog Explorer
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
            Featured Catalog
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            {total} items available
            {searchQuery && (
              <span>
                {" "}for <strong className="text-foreground">"{searchQuery}"</strong>
              </span>
            )}
          </p>
        </div>

        {/* Top Action Bar: Filter & Sort Modal Trigger + Grid Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Main Filter & Sort Modal Trigger Button */}
          <Button
            onClick={() => setFilterModalOpen(true)}
            size="sm"
            className="flex-1 sm:flex-none rounded-xl px-4 py-2 font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters & Sort</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary-foreground text-primary text-[10px] font-black">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Quick Sort Dropdown Trigger */}
          <button
            onClick={() => setFilterModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 border border-border/60 rounded-xl px-3 py-2 bg-card hover:bg-muted/40 transition shadow-2xs text-xs font-semibold text-foreground cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground font-normal">Sort:</span>
            <span>{sortLabels[sort] || "Newest"}</span>
          </button>

          {/* Grid Layout Switcher (Desktop only) */}
          <div className="hidden lg:flex items-center border border-border/60 rounded-xl p-1 bg-card shadow-2xs">
            <button
              onClick={() => setGridColumns(3)}
              className={`p-1.5 rounded-lg transition ${
                gridColumns === 3
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="3 Columns Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridColumns(4)}
              className={`p-1.5 rounded-lg transition ${
                gridColumns === 4
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="4 Columns Grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Category Chips Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hidden">
        {categoryList.map((cat) => {
          const isSelected =
            category.toLowerCase() === cat.id.toLowerCase() ||
            (category === "All" && cat.id === "All")

          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition flex items-center gap-1.5 border ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card hover:bg-muted text-foreground/80 border-border/60"
              }`}
            >
              {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hidden">
          <span className="text-xs text-muted-foreground font-semibold shrink-0 flex items-center gap-1">
            <ListFilter className="w-3.5 h-3.5 text-primary" /> Active:
          </span>

          {sort !== "newest" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 border border-primary/20">
              Sort: {sortLabels[sort]}
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => setSort("newest")}
              />
            </span>
          )}

          {category !== "All" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 border border-primary/20">
              {category}
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => setCategory("All")}
              />
            </span>
          )}

          {rating > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold shrink-0 border border-amber-500/20">
              ★ {rating}★+
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => setRating(0)}
              />
            </span>
          )}

          {price > 0 && price < 300000 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold shrink-0 border border-blue-500/20">
              ≤ ₹{price.toLocaleString()}
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => setPrice(0)}
              />
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold shrink-0 border border-green-500/20">
              In Stock
              <X
                className="w-3 h-3 cursor-pointer hover:opacity-75"
                onClick={() => setInStockOnly(false)}
              />
            </span>
          )}

          <button
            onClick={resetFilters}
            className="text-xs text-red-500 hover:underline font-semibold shrink-0 ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Full-Width Responsive Products Grid */}
      <main className="w-full space-y-6 sm:space-y-8">
        {loading ? (
          <div className="flex justify-center items-center py-28">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 border rounded-3xl p-6 bg-card">
            <p className="text-base font-bold">Failed to load catalog</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="space-y-8">
            {/* Responsive Grid: 2-col on mobile, 3 or 4-col on desktop */}
            <div
              className={`grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-6 ${
                gridColumns === 4
                  ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
              }`}
            >
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  image={product.images?.[0]?.url || product.images?.[0] || ""}
                  price={product.price}
                  rating={product.ratings}
                  category={product.category}
                  stock={product.stock}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6 border-t border-border/50">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    setPage((prev) => Math.max(1, prev - 1))
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="p-2 border rounded-xl hover:bg-muted disabled:opacity-30 transition bg-card"
                  title="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setPage(pageNum)
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                          page === pageNum
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "hover:bg-muted border bg-card text-foreground"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => {
                    setPage((prev) => Math.min(totalPages, prev + 1))
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="p-2 border rounded-xl hover:bg-muted disabled:opacity-30 transition bg-card"
                  title="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border rounded-3xl bg-card p-8">
            <PackageSearch className="w-14 h-14 text-muted-foreground stroke-1" />
            <h3 className="text-xl font-bold">No Products Found</h3>
            <p className="text-muted-foreground text-xs max-w-sm">
              No items match your active filters. Try adjusting price, category, or sorting filters.
            </p>
            <Button
              onClick={resetFilters}
              size="sm"
              className="rounded-full px-6 font-bold text-xs shadow-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>

      {/* 🎛️ Unified Filter & Sort Slide-Over Modal */}
      <FilterSortModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        selectedCategory={category}
        onCategoryChange={setCategory}
        selectedRating={rating}
        onRatingChange={setRating}
        selectedPrice={price}
        onPriceChange={setPrice}
        sort={sort}
        onSortChange={setSort}
        inStockOnly={inStockOnly}
        onInStockChange={setInStockOnly}
        onClear={resetFilters}
        totalCount={total}
      />
    </div>
  )
}
