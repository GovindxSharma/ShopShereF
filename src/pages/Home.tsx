import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchProducts } from "@/redux/slices/productSlice"

import ProductCard from "@/components/products/ProductCard"
import { Button } from "@/components/ui/button"
import Loader from "@/components/common/Loader"

export default function Home() {
  const dispatch = useAppDispatch()
  const { products, loading, error } = useAppSelector((state) => state.products)

  // ✅ Fetch only 6 products on home page
  useEffect(() => {
    dispatch(fetchProducts({ limit: 6 }))
  }, [dispatch])

  return (
    <main className="space-y-20">
      {/* 🚀 Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 sm:px-10 lg:px-20 overflow-hidden pb-6 bg-gradient-to-br from-muted/50 via-background to-muted dark:from-[#0f0f0f] dark:to-[#1a1a1a] transition-colors">
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/20 dark:bg-primary/10 rounded-full blur-3xl"
        />
        <div className="relative z-10 text-center text-foreground max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
            Discover, Shop, Repeat.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-8">
            Explore a curated collection of the latest and greatest products with blazing fast delivery.
          </p>
          <Link to="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </section>

      {/* 🌟 Featured Products */}
      <section className="bg-muted/10 py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Featured Products</h2>
          <p className="text-muted-foreground mb-8 sm:mb-10 max-w-md mx-auto text-sm sm:text-base">
            Handpicked items specially curated for you.
          </p>

          {loading && <Loader/>}
          {error && <p className="text-red-500">Error: {error}</p>}

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                name={product.name}
                image={product.images[0]?.url || ""}
                price={product.price}
                rating={product.ratings}
              />
            ))}
          </div>

          <div className="mt-8 sm:mt-10">
            <Link to="/products">
              <Button  size="lg">See All Products</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
