import { useParams, useNavigate, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { addToCart } from "@/redux/slices/cartSlice"
import { toggleWishlist, selectIsInWishlist } from "@/redux/slices/wishlistSlice"
import {
  fetchReviews,
  submitReview,
  selectReviews,
  resetReviewSuccess,
} from "@/redux/slices/reviewSlice"
import { toast } from "sonner"
import ReviewModal from "@/components/reviews/ReviewModal"
import ReviewList from "@/components/reviews/ReviewList"
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Minus,
  Plus,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  MapPin,
} from "lucide-react"
import { format, addDays } from "date-fns"
import { Button } from "@/components/ui/button"
import Loader from "@/components/common/Loader"
import ProductCard from "@/components/products/ProductCard"

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)

  // PIN Code Delivery Availability State
  const [pincode, setPincode] = useState("")
  const [pincodeChecked, setPincodeChecked] = useState(false)

  const isInWishlist = useAppSelector(selectIsInWishlist(id || ""))

  const {
    reviews,
    loading: reviewLoading,
    success: reviewSuccess,
    error: reviewError,
  } = useAppSelector(selectReviews)

  const { user } = useAppSelector((state) => state.auth)
  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/products/${id}`, {
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Error loading product")
      setProduct(data)
      setSelectedImageIndex(0)
      setQuantity(1)

      // Fetch related products
      try {
        const relatedRes = await fetch(`${API_BASE}/products/${id}/related`)
        const relatedData = await relatedRes.json()
        setRelatedProducts(relatedData.products || [])
      } catch (err) {
        console.warn("Could not fetch related products", err)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchProduct()
      dispatch(fetchReviews(id))
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [id, dispatch])

  useEffect(() => {
    if (reviewSuccess) {
      toast.success("Review submitted successfully")
      setReviewModalOpen(false)
      dispatch(fetchReviews(id!))
      dispatch(resetReviewSuccess())
    }
  }, [reviewSuccess, dispatch, id])

  useEffect(() => {
    if (reviewError) {
      toast.error(reviewError)
    }
  }, [reviewError])

  const handleAddToCart = async () => {
    if (!product) return

    if (!user) {
      toast.warning("Please log in to add items to cart", {
        action: {
          label: "Log In",
          onClick: () => navigate("/login"),
        },
      })
      navigate("/login")
      return
    }

    try {
      for (let i = 0; i < quantity; i++) {
        await dispatch(addToCart(product)).unwrap()
      }
      toast.success(`${quantity} × ${product.name} added to cart!`, {
        action: {
          label: "View Cart",
          onClick: () => navigate("/cart"),
        },
      })
    } catch {
      toast.error("Failed to add to cart")
    }
  }

  const handleWishlistToggle = () => {
    if (!product) return
    dispatch(toggleWishlist(product))
    if (!isInWishlist) {
      toast.success("Added to wishlist!", {
        action: {
          label: "View Wishlist",
          onClick: () => navigate("/wishlist"),
        },
      })
    } else {
      toast.info("Removed from wishlist")
    }
  }

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!id) return
    if (!user) {
      toast.warning("Please sign in to write a review", {
        action: {
          label: "Log In",
          onClick: () => navigate("/login"),
        },
      })
      navigate("/login")
      return
    }
    await dispatch(submitReview({ productId: id, rating, comment }))
    fetchProduct()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <p className="text-red-500 text-base font-bold">Error: {error}</p>
        <Link to="/products">
          <Button variant="outline" size="sm">Back to Products</Button>
        </Link>
      </div>
    )
  }

  if (!product) return null

  const imageList =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img: any) => (typeof img === "string" ? { url: img } : img))
      : product.image
      ? [{ url: product.image }]
      : [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop" }]

  const currentImageUrl =
    imageList[selectedImageIndex]?.url ||
    imageList[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 sm:space-y-16 pb-24 md:pb-16">
      {/* Breadcrumb Bar */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-primary transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span>/</span>
        <Link to="/products" className="hover:text-primary transition font-medium">
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold truncate max-w-[160px] sm:max-w-[240px]">
          {product.name}
        </span>
      </div>

      {/* Main 2-Column Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Sticky Image Gallery (6 cols) */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
          {/* Main Image Frame with Fixed Aspect Ratio & Clean Padding */}
          <div className="relative w-full aspect-square max-h-[480px] rounded-3xl bg-muted/20 dark:bg-muted/10 border border-border/70 p-6 sm:p-8 flex items-center justify-center overflow-hidden shadow-xs">
            <img
              src={currentImageUrl}
              alt={product.name}
              className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300 hover:scale-105"
            />

            {/* Wishlist Heart Toggle */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-md backdrop-blur-md transition ${
                isInWishlist
                  ? "bg-red-500 text-white shadow-red-500/20"
                  : "bg-background/80 text-foreground/80 hover:text-red-500 hover:bg-background"
              }`}
              title="Save to wishlist"
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? "fill-white" : ""}`} />
            </button>

            {/* Stock Pill Badge */}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="absolute bottom-4 left-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500 text-white shadow-xs">
                Only {product.stock} left in stock
              </span>
            )}
          </div>

          {/* Thumbnail Gallery Row */}
          {imageList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hidden">
              {imageList.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl border-2 p-1.5 bg-muted/20 overflow-hidden transition shrink-0 ${
                    selectedImageIndex === idx
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-border/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Information & Purchase Panel (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Info */}
          <div className="space-y-2">
            {product.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> {product.category}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Rating Summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.ratings || 5)
                      ? "fill-amber-500 stroke-amber-500"
                      : "stroke-gray-300 dark:stroke-gray-600"
                  }`}
                />
              ))}
              <span className="text-sm font-extrabold text-foreground ml-1.5">
                {product.ratings ? Number(product.ratings).toFixed(1) : "5.0"}
              </span>
            </div>

            <span className="text-xs text-muted-foreground">·</span>

            <button
              onClick={() => {
                const el = document.getElementById("reviews-section")
                el?.scrollIntoView({ behavior: "smooth" })
              }}
              className="text-xs text-muted-foreground hover:text-primary transition underline font-medium"
            >
              {product.numOfReviews || 0} customer reviews
            </button>
          </div>

          {/* Price & Delivery Badge */}
          <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Price (GST Included)</p>
              <span className="text-3xl sm:text-4xl font-black text-primary">
                ₹{product.price.toLocaleString()}
              </span>
            </div>

            <div className="text-right space-y-0.5">
              <span className="inline-block text-xs font-bold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">
                Free Nationwide Shipping
              </span>
              <p className="text-[11px] text-muted-foreground">Dispatches within 24h</p>
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Overview & Details
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock Availability */}
          <div className="pt-2">
            {product.stock === 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-500">
                Out of Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600">
                <CheckCircle2 className="w-4 h-4" /> Only {product.stock} items remaining
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-600">
                <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock} units available)
              </span>
            )}
          </div>

          {/* 📍 Real-World Delivery PIN Code Checker */}
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 space-y-2.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery & COD Availability
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, ""))
                  setPincodeChecked(false)
                }}
                className="flex-1 border rounded-xl px-3 py-1.5 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pincode.length !== 6}
                onClick={() => {
                  setPincodeChecked(true)
                  toast.success(`Standard delivery available for PIN ${pincode}!`)
                }}
                className="rounded-xl text-xs font-bold"
              >
                Check
              </Button>
            </div>

            {pincodeChecked && (
              <div className="text-xs text-muted-foreground space-y-1 pt-1 animate-in fade-in">
                <p className="text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Delivery by{" "}
                  <strong>{format(addDays(new Date(), 3), "EEEE, dd MMM")}</strong>
                </p>
                <p className="text-[11px]">Free Standard Shipping · Cash on Delivery Eligible</p>
              </div>
            )}
          </div>

          {/* Desktop Quantity & Action Buttons */}
          <div className="hidden sm:flex items-center gap-4 pt-4 border-t border-border/50">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-border/70 rounded-2xl bg-card shadow-2xs">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 hover:bg-muted disabled:opacity-30 rounded-l-2xl transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-bold text-sm">{quantity}</span>
              <button
                disabled={quantity >= product.stock}
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="p-3 hover:bg-muted disabled:opacity-30 rounded-r-2xl transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <Button
              size="lg"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className="flex-1 rounded-2xl shadow-md font-bold flex items-center justify-center gap-2 h-12 text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </Button>

            {/* Wishlist CTA */}
            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlistToggle}
              className="rounded-2xl h-12 px-4"
              title="Toggle Wishlist"
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>

          {/* Trust Value Propositions Strip */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/50 text-xs text-muted-foreground text-center">
            <div className="p-3 rounded-2xl bg-muted/30 flex flex-col items-center justify-center gap-1.5">
              <Truck className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">Free Shipping</span>
            </div>
            <div className="p-3 rounded-2xl bg-muted/30 flex flex-col items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-foreground">Authentic Product</span>
            </div>
            <div className="p-3 rounded-2xl bg-muted/30 flex flex-col items-center justify-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-foreground">7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Add-to-Cart Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t p-3 flex items-center gap-3 shadow-2xl">
        <div className="flex items-center border rounded-xl bg-card">
          <button
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2 hover:bg-muted disabled:opacity-30"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-2.5 font-bold text-xs">{quantity}</span>
          <button
            disabled={quantity >= product.stock}
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="p-2 hover:bg-muted disabled:opacity-30"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <Button
          disabled={product.stock === 0}
          onClick={handleAddToCart}
          className="flex-1 rounded-xl font-bold text-xs h-10 shadow-md flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart (₹{(product.price * quantity).toLocaleString()})
        </Button>
      </div>

      {/* Similar / Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 border-t pt-10 sm:pt-14">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Similar Products in {product.category}
            </h2>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="text-xs text-primary font-bold hover:underline">
              View Category
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p._id}
                id={p._id}
                name={p.name}
                image={p.images?.[0]?.url || p.image || ""}
                price={p.price}
                rating={p.ratings}
                category={p.category}
                stock={p.stock}
              />
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section id="reviews-section" className="space-y-6 border-t pt-10 sm:pt-14">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" /> Customer Reviews
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Verified feedback from genuine shoppers
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setReviewModalOpen(true)}
            className="rounded-xl shadow-xs text-xs font-semibold"
          >
            Write a Review
          </Button>
        </div>

        <ReviewList
          reviews={reviews && reviews.length > 0 ? reviews : product.reviews || []}
          productId={id}
        />

        <ReviewModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={handleSubmitReview}
          loading={reviewLoading}
        />
      </section>
    </div>
  )
}
