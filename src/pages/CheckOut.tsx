import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import {
  createRazorpayOrder,
  createAppOrder,
  createDemoOrder,
  verifyPayment,
} from "@/redux/slices/orderSlice"
import { fetchCart } from "@/redux/slices/cartSlice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useNavigate, Link } from "react-router-dom"
import { unwrapResult } from "@reduxjs/toolkit"
import {
  CreditCard,
  Zap,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items } = useAppSelector((state) => state.cart)
  const { user } = useAppSelector((state) => state.auth)

  const [paymentMethod, setPaymentMethod] = useState<"demo" | "razorpay" | "cod">("demo")
  const [submitting, setSubmitting] = useState(false)

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    phone: "",
  })

  // Read saved discount from sessionStorage
  const [couponCode, setCouponCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)

  useEffect(() => {
    const savedCoupon = sessionStorage.getItem("shopshere_coupon")
    const savedDiscount = sessionStorage.getItem("shopshere_discount")
    if (savedCoupon) setCouponCode(savedCoupon)
    if (savedDiscount) setDiscountAmount(Number(savedDiscount) || 0)
  }, [])

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
    0
  )

  const totalAmount = Math.max(0, subtotal - discountAmount)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async () => {
    if (!address.fullName.trim()) {
      toast.error("Please enter your full name.")
      return
    }
    if (!address.address.trim()) {
      toast.error("Please enter your street address.")
      return
    }
    if (!address.city.trim() || !address.state.trim() || !address.postalCode.trim()) {
      toast.error("Please fill in your complete city, state, and postal code.")
      return
    }
    if (!address.phone.trim()) {
      toast.error("Please provide a contact phone number.")
      return
    }

    if (items.length === 0) {
      toast.error("Your cart is empty.")
      navigate("/cart")
      return
    }

    const orderItems = items.map((item) => {
      const img =
        item.product.images?.[0]?.url ||
        (typeof item.product.images?.[0] === "string" ? item.product.images[0] : "") ||
        item.product.image ||
        ""

      return {
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: img,
        quantity: item.quantity,
      }
    })

    setSubmitting(true)

    // Option 1 & Option 3: Instant Demo Checkout or Cash on Delivery
    if (paymentMethod === "demo" || paymentMethod === "cod") {
      try {
        await dispatch(
          createDemoOrder({
            items: orderItems,
            shippingAddress: address,
            totalAmount,
            discountAmount,
            couponCode,
            paymentMethod,
          })
        ).then(unwrapResult)

        await dispatch(fetchCart())
        sessionStorage.removeItem("shopshere_coupon")
        sessionStorage.removeItem("shopshere_discount")

        toast.success(
          paymentMethod === "demo"
            ? "Order placed successfully! (Demo Payment Verified)"
            : "Order placed with Cash on Delivery!"
        )
        navigate("/orders")
      } catch (err: any) {
        console.error(err)
        toast.error(err.message || "Failed to place order")
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Option 2: Razorpay Payment Gateway
    try {
      if (!window.Razorpay) {
        toast.warning("Razorpay script not loaded. Switching to Instant Demo Checkout.")
        await dispatch(
          createDemoOrder({
            items: orderItems,
            shippingAddress: address,
            totalAmount,
            discountAmount,
            couponCode,
            paymentMethod: "demo",
          })
        ).then(unwrapResult)

        await dispatch(fetchCart())
        toast.success("Order placed successfully via Instant Mode!")
        navigate("/orders")
        return
      }

      const razorRes = await dispatch(createRazorpayOrder(totalAmount)).then(unwrapResult)

      const orderRes = await dispatch(
        createAppOrder({
          items: orderItems,
          shippingAddress: address,
          totalAmount,
          discountAmount,
          couponCode,
          razorpayOrderId: razorRes.id,
        })
      ).then(unwrapResult)

      const orderId = orderRes._id

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_key",
        amount: razorRes.amount,
        currency: "INR",
        order_id: razorRes.id,
        handler: async (response: any) => {
          await dispatch(
            verifyPayment({
              orderId,
              payment: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            })
          )

          await dispatch(fetchCart())
          sessionStorage.removeItem("shopshere_coupon")
          sessionStorage.removeItem("shopshere_discount")
          toast.success("Payment successful and verified!")
          navigate("/orders")
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: {
          color: "#4f46e5",
        },
      })

      rzp.open()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Payment initiation failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 min-h-[75vh]">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          to="/cart"
          className="text-xs text-muted-foreground hover:text-primary transition flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
      </div>

      <div className="border-b pb-4">
        <h1 className="text-3xl font-black tracking-tight">Checkout</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete your delivery details and choose your preferred payment mode
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left 2 Columns: Address & Payment Method */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Shipping Address */}
          <div className="border rounded-2xl p-6 bg-card shadow-xs space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" /> 1. Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Full Name *
                </label>
                <input
                  name="fullName"
                  placeholder="e.g. Alex Sharma"
                  value={address.fullName}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Street Address / Apartment / Flat *
                </label>
                <input
                  name="address"
                  placeholder="e.g. 402, Highrise Heights, MG Road"
                  value={address.address}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  City *
                </label>
                <input
                  name="city"
                  placeholder="e.g. Bengaluru"
                  value={address.city}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  State / Province *
                </label>
                <input
                  name="state"
                  placeholder="e.g. Karnataka"
                  value={address.state}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Postal / PIN Code *
                </label>
                <input
                  name="postalCode"
                  placeholder="e.g. 560001"
                  value={address.postalCode}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Phone Number *
                </label>
                <input
                  name="phone"
                  placeholder="e.g. +91 9876543210"
                  value={address.phone}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Payment Method Selector */}
          <div className="border rounded-2xl p-6 bg-card shadow-xs space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> 2. Choose Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option A: Instant Demo Payment */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === "demo"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Instant Demo
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="demo"
                    checked={paymentMethod === "demo"}
                    onChange={() => setPaymentMethod("demo")}
                    className="accent-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Instantly creates verified order with inventory deduction for testing.
                </p>
                <span className="text-[10px] font-bold text-green-600 uppercase">
                  ✓ Recommended for review
                </span>
              </label>

              {/* Option B: Razorpay Live Gateway */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === "razorpay"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Razorpay Gateway
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="accent-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  UPI, Credit / Debit Cards, Net Banking via Razorpay modal.
                </p>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Live Gateway
                </span>
              </label>

              {/* Option C: Cash on Delivery */}
              <label
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Truck className="w-4 h-4 text-blue-500" />
                    Cash on Delivery
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Pay cash upon doorstep package delivery.
                </p>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Pay on arrival
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Confirmation */}
        <div className="space-y-6">
          <div className="border rounded-2xl p-6 bg-card shadow-xs space-y-6">
            <h2 className="text-lg font-bold border-b pb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" /> Order Items ({items.length})
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-border/40">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={product.images?.[0]?.url || product.image || ""}
                      alt={product.name}
                      className="w-10 h-10 object-contain rounded-md bg-muted/40 p-1 border"
                    />
                    <div>
                      <p className="text-xs font-semibold line-clamp-1 max-w-[140px]">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Qty: {quantity} × ₹{product.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold">
                    ₹{((product.price || 0) * (quantity || 1)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2.5 text-sm border-t pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">₹{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold text-xs">
                  <span>Promo Discount ({couponCode})</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span className="text-green-600 font-semibold">FREE</span>
              </div>

              <div className="flex justify-between text-base font-black border-t pt-3 text-foreground">
                <span>Grand Total</span>
                <span className="text-primary text-xl">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <Button
              size="lg"
              disabled={submitting}
              onClick={handlePlaceOrder}
              className="w-full rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? (
                "Processing Order..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Place Order (₹{totalAmount.toLocaleString()})
                </>
              )}
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Safe & Verified Order Processing</span>
            </div>
            <p>Your order details and payment transactions are strictly encrypted.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
