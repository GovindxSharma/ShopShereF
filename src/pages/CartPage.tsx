import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "@/redux/slices/cartSlice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useNavigate, Link } from "react-router-dom"
import Loader from "@/components/common/Loader"
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
  Minus,
  Plus,
  ArrowLeft,
  Check,
  Clock,
  TicketPercent,
  X,
} from "lucide-react"
import { format, addDays } from "date-fns"
import ConfirmModal from "@/components/common/ConfirmModal"

interface Coupon {
  code: string
  discountPercent?: number
  discountFlat?: number
  maxDiscount?: number
  minPurchase: number
  description: string
  expiryDate: string
}

export default function CartPage() {
  const { items, loading } = useAppSelector((state) => state.cart)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [couponCode, setCouponCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [showClearCartConfirm, setShowClearCartConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  // Fetch available promotions
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${API_BASE}/coupons`)
        const data = await res.json()
        if (data.success && data.coupons) {
          setAvailableCoupons(data.coupons)
        }
      } catch (err) {
        console.warn("Could not load coupons", err)
      }
    }
    fetchCoupons()
  }, [API_BASE])

  const subtotal = items.reduce(
    (sum, i) => sum + (i.product?.price || 0) * (i.quantity || 1),
    0
  )

  const handleQuantityChange = (productId: string, newQty: number) => {
    if (newQty < 1) return
    dispatch(updateCartItem({ id: productId, quantity: newQty }))
  }

  const handleRemove = (productId: string, name: string) => {
    dispatch(removeFromCart(productId))
      .unwrap()
      .then(() => toast.success(`${name} removed from cart`))
      .catch(() => toast.error("Failed to remove item"))
  }

  const applyCouponCode = async (codeToApply: string) => {
    const cleanCode = codeToApply.trim().toUpperCase()
    if (!cleanCode) return

    setValidating(true)
    try {
      const res = await fetch(`${API_BASE}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, subtotal }),
      })

      const data = await res.json()
      if (res.ok && data.valid) {
        setAppliedCoupon(data.couponCode)
        setDiscountAmount(data.discountAmount)
        setCouponCode(data.couponCode)
        setShowCouponModal(false)
        toast.success(data.message)
      } else {
        toast.error(data.message || "Invalid coupon code")
      }
    } catch {
      // Fallback local calculation
      if (cleanCode === "SHOPSHERE10") {
        const discount = Math.round((subtotal * 10) / 100)
        setAppliedCoupon("SHOPSHERE10")
        setDiscountAmount(discount)
        setShowCouponModal(false)
        toast.success("Coupon SHOPSHERE10 applied! 10% discount added.")
      } else {
        toast.error("Could not validate coupon. Try SHOPSHERE10")
      }
    } finally {
      setValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscountAmount(0)
    setCouponCode("")
    sessionStorage.removeItem("shopshere_coupon")
    sessionStorage.removeItem("shopshere_discount")
    toast.info("Coupon removed")
  }

  const handleClearCart = async () => {
    setClearing(true)
    try {
      await dispatch(clearCart()).unwrap()
      handleRemoveCoupon()
      setShowClearCartConfirm(false)
      toast.info("Cart cleared")
    } catch {
      toast.error("Failed to clear cart")
    } finally {
      setClearing(false)
    }
  }

  const totalAmount = Math.max(0, subtotal - discountAmount)

  // Estimated delivery date (3-4 days from now)
  const estimatedDelivery = format(addDays(new Date(), 3), "EEEE, dd MMM")

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty.")
      return
    }

    if (appliedCoupon) {
      sessionStorage.setItem("shopshere_coupon", appliedCoupon)
      sessionStorage.setItem("shopshere_discount", discountAmount.toString())
    } else {
      sessionStorage.removeItem("shopshere_coupon")
      sessionStorage.removeItem("shopshere_discount")
    }

    navigate("/checkout")
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 min-h-[75vh]">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowClearCartConfirm(true)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Clear Cart
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border rounded-3xl bg-card p-6 sm:p-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Your Cart is Empty</h2>
          <p className="text-muted-foreground max-w-sm text-xs sm:text-sm">
            Discover our curated fashion and essentials catalog and add your favorite items!
          </p>
          <Link to="/products">
            <Button size="lg" className="rounded-full px-8 shadow-xs flex items-center gap-2 text-xs font-bold">
              Explore Catalog <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 items-start">
          {/* Items List (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* Delivery Estimation Banner */}
            <div className="p-3 sm:p-4 rounded-2xl bg-muted/40 border flex items-center gap-3 text-xs">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-muted-foreground">
                Estimated Delivery: <strong className="text-foreground font-semibold">{estimatedDelivery}</strong> (Free Standard Shipping)
              </p>
            </div>

            {items.map(({ product, quantity }) => {
              if (!product) return null
              const itemTotal = (product.price || 0) * (quantity || 1)

              return (
                <div
                  key={product._id}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between border rounded-2xl p-3.5 sm:p-4 bg-card shadow-2xs hover:shadow-xs transition"
                >
                  <div className="flex gap-3 sm:gap-4 items-center">
                    <img
                      src={
                        product.images?.[0]?.url ||
                        product.image ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop"
                      }
                      alt={product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl bg-muted/40 p-2 border shrink-0"
                    />

                    <div className="space-y-0.5 sm:space-y-1">
                      <Link
                        to={`/products/${product._id}`}
                        className="font-bold text-xs sm:text-sm hover:text-primary transition line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Unit Price: ₹{product.price?.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-green-600 font-semibold">In Stock</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border rounded-xl bg-background shadow-2xs">
                      <button
                        onClick={() => handleQuantityChange(product._id, quantity - 1)}
                        className="p-1.5 hover:bg-muted disabled:opacity-30 rounded-l-xl transition"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 font-bold text-xs">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(product._id, quantity + 1)}
                        className="p-1.5 hover:bg-muted rounded-r-xl transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price Total */}
                    <div className="text-right min-w-[80px]">
                      <p className="font-extrabold text-sm sm:text-base text-primary">
                        ₹{itemTotal.toLocaleString()}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleRemove(product._id, product.name)}
                      className="p-1.5 sm:p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}

            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary & Coupon Card (Right col) */}
          <div className="space-y-4 sm:space-y-6">
            <div className="border rounded-2xl p-5 sm:p-6 bg-card shadow-xs space-y-5">
              <h2 className="text-base sm:text-lg font-bold border-b pb-3">Order Summary</h2>

              {/* Promo Coupon Form */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-primary" /> Apply Promo Code
                  </label>
                  {availableCoupons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCouponModal(true)}
                      className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <TicketPercent className="w-3.5 h-3.5" /> View Offers
                    </button>
                  )}
                </div>

                {!appliedCoupon ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      applyCouponCode(couponCode)
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Try SHOPSHERE10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border rounded-xl px-3 py-2 text-xs bg-background uppercase font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={validating || !couponCode.trim()}
                      className="rounded-xl text-xs font-bold"
                    >
                      {validating ? "Validating..." : "Apply"}
                    </Button>
                  </form>
                ) : (
                  <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-green-600 font-bold">
                      <Check className="w-4 h-4" />
                      <span>{appliedCoupon} Applied (Saved ₹{discountAmount.toLocaleString()})</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-muted-foreground hover:text-red-500 font-bold p-1"
                      title="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 text-xs sm:text-sm border-t pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">₹{subtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Standard Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes (Included)</span>
                  <span className="font-semibold text-foreground">₹0.00</span>
                </div>

                <div className="flex justify-between text-base sm:text-lg font-black border-t pt-3 text-foreground">
                  <span>Total Payable</span>
                  <span className="text-primary text-lg sm:text-xl">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                onClick={handleCheckout}
                className="w-full rounded-xl font-bold shadow-md flex items-center justify-center gap-2 h-11 text-xs sm:text-sm"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="p-4 rounded-2xl bg-muted/30 border space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Guaranteed Safe & Secure Checkout</span>
              </div>
              <p>Supports Instant Demo Orders, COD, and Razorpay Gateway.</p>
            </div>
          </div>
        </div>
      )}

      {/* Available Coupons Drawer / Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl p-6 max-w-md w-full space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2 font-bold text-base">
                <TicketPercent className="w-5 h-5 text-primary" />
                <span>Available Offers & Coupons</span>
              </div>
              <button
                onClick={() => setShowCouponModal(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {availableCoupons.map((c) => {
                const isApplicable = subtotal >= c.minPurchase
                const isCurrent = appliedCoupon === c.code

                return (
                  <div
                    key={c.code}
                    className={`p-3.5 rounded-2xl border transition space-y-2 ${
                      isCurrent
                        ? "border-green-500 bg-green-500/5 ring-1 ring-green-500"
                        : "bg-muted/20"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-md border border-primary/20">
                          {c.code}
                        </span>
                        <p className="text-xs font-semibold text-foreground mt-1.5">
                          {c.description}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant={isCurrent ? "outline" : "default"}
                        disabled={!isApplicable || isCurrent}
                        onClick={() => applyCouponCode(c.code)}
                        className="rounded-xl text-xs h-7 px-3 shrink-0"
                      >
                        {isCurrent ? "Applied" : "Apply"}
                      </Button>
                    </div>

                    {!isApplicable && (
                      <p className="text-[10px] text-amber-600 font-semibold">
                        Add ₹{(c.minPurchase - subtotal).toLocaleString()} more to unlock
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Built-in Clear Cart Confirmation Modal */}
      <ConfirmModal
        open={showClearCartConfirm}
        title="Clear Shopping Cart"
        message="Are you sure you want to remove all items from your shopping cart? This cannot be undone."
        confirmText="Yes, Clear Cart"
        cancelText="Keep Items"
        variant="destructive"
        loading={clearing}
        onConfirm={handleClearCart}
        onCancel={() => setShowClearCartConfirm(false)}
      />
    </div>
  )
}
