import { Link, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { selectWishlistItems, removeFromWishlist, clearWishlist } from "@/redux/slices/wishlistSlice"
import { addToCart } from "@/redux/slices/cartSlice"
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingBag, Heart, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export default function WishlistPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const wishlist = useAppSelector(selectWishlistItems)
  const { user } = useAppSelector((state) => state.auth)

  const handleAddToCart = async (product: any) => {
    if (!user) {
      toast.warning("Please log in to add items to cart", {
        action: {
          label: "Log In",
          onClick: () => navigate("/login"),
        },
      })
      return
    }
    try {
      await dispatch(addToCart(product)).unwrap()
      toast.success(`${product.name} added to cart!`, {
        action: {
          label: "View Cart",
          onClick: () => navigate("/cart"),
        },
      })
    } catch {
      toast.error("Failed to add to cart")
    }
  }

  const handleRemove = (id: string, name: string) => {
    dispatch(removeFromWishlist(id))
    toast.info(`${name} removed from wishlist`)
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 space-y-8 min-h-[70vh]">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved for later
          </p>
        </div>

        {wishlist.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dispatch(clearWishlist())
              toast.info("Wishlist cleared")
            }}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Clear Wishlist
          </Button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
          <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-500">
            <Heart className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold">Your Wishlist is Empty</h2>
          <p className="text-muted-foreground max-w-md text-sm sm:text-base">
            Explore our curated catalog and tap the heart icon on any product to save it here for later.
          </p>
          <Link to="/products">
            <Button size="lg" className="flex items-center gap-2">
              Explore Products <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="group relative bg-card border rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative overflow-hidden rounded-xl bg-muted/30 aspect-square mb-4">
                <img
                  src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop"}
                  alt={product.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => handleRemove(product._id, product.name)}
                  className="absolute top-2 right-2 bg-background/80 hover:bg-red-500 hover:text-white p-2 rounded-full shadow transition"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 flex-grow">
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {product.category}
                </span>
                <Link to={`/products/${product._id}`}>
                  <h3 className="font-semibold text-base line-clamp-2 hover:text-primary transition">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">
                    ₹{product.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t flex gap-2">
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 flex items-center justify-center gap-2"
                  size="sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </Button>
                <Link to={`/products/${product._id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
