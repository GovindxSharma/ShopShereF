import { Star, Heart, ShoppingBag } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { toggleWishlist, selectIsInWishlist } from "@/redux/slices/wishlistSlice"
import { addToCart } from "@/redux/slices/cartSlice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Props {
  id: string
  name: string
  image?: any
  price: number
  rating: number
  category?: string
  stock?: number
}

export default function ProductCard({
  id,
  name,
  image = "",
  price,
  rating = 5,
  category,
  stock = 10,
}: Props) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isInWishlist = useAppSelector(selectIsInWishlist(id))
  const { user } = useAppSelector((state) => state.auth)

  const imageUrl =
    typeof image === "string" && image.trim()
      ? image
      : image?.url
      ? image.url
      : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(
      toggleWishlist({
        _id: id,
        name,
        price,
        ratings: rating,
        category: category || "General",
        images: [{ public_id: "img", url: imageUrl }],
        stock: stock || 1,
        description: "",
        numOfReviews: 0,
        reviews: [],
        user: "",
        createdAt: new Date().toISOString(),
      })
    )
    if (!isInWishlist) {
      toast.success(`${name} added to wishlist!`, {
        action: {
          label: "View Wishlist",
          onClick: () => navigate("/wishlist"),
        },
      })
    } else {
      toast.info(`${name} removed from wishlist`)
    }
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.warning("Please log in to add items to your cart", {
        action: {
          label: "Log In",
          onClick: () => navigate("/login"),
        },
      })
      return
    }

    try {
      await dispatch(
        addToCart({
          _id: id,
          name,
          price,
          images: [{ url: imageUrl }],
          image: imageUrl,
        })
      ).unwrap()
      toast.success(`${name} added to cart!`, {
        action: {
          label: "View Cart",
          onClick: () => navigate("/cart"),
        },
      })
    } catch {
      toast.error("Failed to add to cart")
    }
  }

  return (
    <div className="group relative rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-2.5 sm:p-4 shadow-2xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Image area & Wishlist */}
      <div className="relative">
        <div className="relative h-36 xs:h-44 sm:h-56 w-full rounded-xl sm:rounded-2xl bg-muted/30 overflow-hidden mb-2 sm:mb-3.5">
          <Link
            to={`/products/${id}`}
            className="w-full h-full flex items-center justify-center p-2 sm:p-3.5 block"
          >
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-contain group-hover:scale-108 transition-transform duration-300 ease-out"
              onError={(e) =>
                ((e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop")
              }
            />
          </Link>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2.5 rounded-full backdrop-blur-md shadow-xs transition z-10 ${
              isInWishlist
                ? "bg-red-500 text-white shadow-red-500/20"
                : "bg-background/80 text-foreground/80 hover:text-red-500 hover:bg-background"
            }`}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isInWishlist ? "fill-white" : ""}`}
            />
          </button>

          {/* Stock Tag */}
          {stock === 0 ? (
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-red-500 text-white shadow-xs">
              Out of Stock
            </span>
          ) : stock <= 5 ? (
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs">
              {stock} left
            </span>
          ) : null}
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-1 sm:space-y-2 flex-grow flex flex-col justify-between">
        <div>
          {category && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
              {category}
            </span>
          )}

          <Link to={`/products/${id}`} className="block group-hover:text-primary transition">
            <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 mt-0.5 leading-snug">
              {name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 pt-1">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-500 stroke-amber-500" />
              <span className="text-[11px] sm:text-xs font-bold ml-1 text-foreground">
                {rating ? Number(rating).toFixed(1) : "5.0"}
              </span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="pt-2 sm:pt-3.5 flex items-center justify-between border-t border-border/40 mt-2 sm:mt-3 gap-1">
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[11px] text-muted-foreground font-medium truncate">Price</p>
              <span className="text-xs sm:text-base md:text-lg font-black text-primary truncate block">
                ₹{price.toLocaleString()}
              </span>
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={stock === 0}
              className="rounded-xl font-bold px-2 sm:px-3 py-1 text-[11px] sm:text-xs h-7 sm:h-8 shadow-2xs hover:scale-105 transition-transform shrink-0 flex items-center gap-1"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Add</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
