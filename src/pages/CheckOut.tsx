import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import {
  createRazorpayOrder,
  createAppOrder,
  verifyPayment,
} from "@/redux/slices/orderSlice"
import { fetchCart } from "@/redux/slices/cartSlice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { unwrapResult } from "@reduxjs/toolkit"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items } = useAppSelector((state) => state.cart)

  const [address, setAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    phone: "",
  })

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceOrder = async () => {
    if (Object.values(address).some((val) => !val.trim())) {
      toast.error("Please fill in all address fields.")
      return
    }

    try {
      // 1️⃣ Create Razorpay order
      const razorRes = await dispatch(createRazorpayOrder(totalAmount)).then(unwrapResult)

      // 2️⃣ Prepare item data
      const orderItems = items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images?.[0]?.url || "",
        quantity: item.quantity,
      }))

      // 3️⃣ Create app order
      const orderRes = await dispatch(
        createAppOrder({
          items: orderItems,
          shippingAddress: address,
          totalAmount,
          razorpayOrderId: razorRes.id,
        })
      ).then(unwrapResult)

      const orderId = orderRes._id

      // 4️⃣ Launch Razorpay
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID!,
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

          // ✅ REFRESH Redux cart after order
          await dispatch(fetchCart())

          // ✅ Optional: Clear address
          setAddress({
            fullName: "",
            address: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
            phone: "",
          })

          toast.success("Payment successful!")
          navigate("/orders")
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: {
          color: "#6366f1",
        },
      })

      rzp.open()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Payment failed")
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(address).map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.replace(/([A-Z])/g, " $1")}
            value={(address as any)[field]}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          />
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
        <ul className="text-sm space-y-1">
          {items.map(({ product, quantity }) => (
            <li key={product._id}>
              {product.name} × {quantity} = ₹{product.price * quantity}
            </li>
          ))}
        </ul>
        <div className="text-right font-bold mt-4">Total: ₹{totalAmount}</div>
      </div>

      <div className="text-right">
        <Button onClick={handlePlaceOrder}>Pay ₹{totalAmount}</Button>
      </div>
    </div>
  )
}
