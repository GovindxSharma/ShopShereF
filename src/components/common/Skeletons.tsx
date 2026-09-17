import { Skeleton } from "@/components/ui/skeleton"

/**
 * 📦 ProductCardSkeleton
 * Matches the exact geometry of ProductCard to ensure 0.00 CLS (Cumulative Layout Shift)
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-2.5 sm:p-4 shadow-2xs flex flex-col justify-between overflow-hidden">
      {/* Image Container Skeleton */}
      <div className="relative h-36 xs:h-44 sm:h-56 w-full rounded-xl sm:rounded-2xl bg-muted/40 overflow-hidden mb-2 sm:mb-3.5">
        <Skeleton className="w-full h-full rounded-xl sm:rounded-2xl" />
        {/* Wishlist placeholder */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background/60 backdrop-blur-xs" />
      </div>

      {/* Info Section Skeleton */}
      <div className="space-y-2 flex-grow flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Category Tag */}
          <Skeleton className="h-3 w-16 rounded" />
          {/* Product Title */}
          <Skeleton className="h-4 w-4/5 rounded" />
          <Skeleton className="h-4 w-3/5 rounded" />
        </div>

        <div className="space-y-2 pt-1">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-12 rounded" />
            <Skeleton className="h-3 w-6 rounded" />
          </div>

          {/* Price & Action Row */}
          <div className="pt-2 sm:pt-3 flex items-center justify-between border-t border-border/40 gap-2">
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-8 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            {/* Button */}
            <Skeleton className="h-8 w-14 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 📦 ProductGridSkeleton
 * Renders an 8-card responsive catalog grid
 */
export function ProductGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: number }) {
  return (
    <div
      className={`grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-6 ${
        columns === 4
          ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 📦 ProductHorizontalTrackSkeleton
 * Matches the horizontal swipe track on the Home page Trending section
 */
export function ProductHorizontalTrackSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className="flex gap-4 sm:gap-6 overflow-x-hidden pb-4 pt-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-none w-60 sm:w-72">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  )
}

/**
 * 📦 ProductDetailSkeleton
 * Matches the 2-column Product Detail layout
 */
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl bg-muted/50 border border-border/60" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted/40 border border-border/40" />
            ))}
          </div>
        </div>

        {/* Right Column: Product Meta & Purchase Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 sm:h-10 w-4/5 rounded-xl" />
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>

          <div className="space-y-2 border-y border-border/50 py-4">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-3.5 w-48 rounded" />
          </div>

          <div className="space-y-2.5">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>

          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 w-32 rounded-2xl" />
            <Skeleton className="h-12 flex-1 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 📦 PageFallbackSkeleton
 * Lightweight, non-intrusive container wireframe for route transitions
 */
export function PageFallbackSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted/50 rounded-xl" />
      <div className="h-4 w-96 bg-muted/40 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted/30 rounded-2xl border border-border/40" />
        ))}
      </div>
    </div>
  )
}
