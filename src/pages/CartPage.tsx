import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
} from "@/redux/slices/cartSlice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import Loader from "@/components/common/Loader"

export default function CartPage() {
  const { items, loading } = useAppSelector((state) => state.cart)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  useEffect(() => {
    if (!loading && items.length === 0) {
      const timer = setTimeout(() => navigate("/products"), 3000)
      return () => clearTimeout(timer)
    }
  }, [items, loading, navigate])

  const handleQuantityChange = (productId: string, quantity: number) => {
    dispatch(updateCartItem({ id: productId, quantity })) // ✅ FIXED: key is `id`, not `product`
  }

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId))
      .unwrap()
      .then(() => toast.success("Item removed"))
      .catch(() => toast.error("Failed to remove item"))
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.")
      return
    }
    navigate("/checkout")
  }

  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  )

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {loading ? (
        <Loader/>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/11010/11010851.png"
            alt="Empty cart illustration"
            className="w-32 h-32 mb-6 object-contain opacity-80 dark:opacity-60"
          />
          <p className="text-muted-foreground text-lg mb-4">
            Your cart is empty. Redirecting to products...
          </p>
          <Button onClick={() => navigate("/products")}>
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product._id}
              className="flex gap-4 items-center border rounded-md p-4 shadow-sm"
            >
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-muted-foreground">₹{product.price}</p>
                <div className="flex gap-2 mt-2 items-center">
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(product._id, +e.target.value)
                    }
                    className="w-16 border px-2 py-1 rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(product._id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* 💳 Total & Checkout Section */}
          <div className="mt-8 border-t pt-6 space-y-4">
            <div className="text-right font-bold text-lg">
              Total: ₹{total.toFixed(2)}
            </div>
            <div className="text-right">
              <Button onClick={handleCheckout}>Proceed to Checkout</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
