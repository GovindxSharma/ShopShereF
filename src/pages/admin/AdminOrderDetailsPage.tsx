import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { toast } from "sonner"
import Loader from "@/components/common/Loader"

interface OrderDetail {
  _id: string
  user: { name: string; email: string }
  items: {
    _id: string
    name: string
    image: string
    price: number
    quantity: number
  }[]
  totalAmount: number
  isDelivered: boolean
  createdAt: string
  deliveredAt?: string
  shippingAddress: {
    fullName: string
    address: string
    city: string
    postalCode: string
    state: string
    country: string
    phone: string
  }
}

const AdminOrderDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderDetail | null>(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/admin/${id}`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch order")
        const data = await res.json()
        setOrder(data)
      } catch (err) {
        toast.error("Could not load order details")
      }
    }

    fetchOrderDetails()
  }, [id])

  if (!order) {
    return <Loader/>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => navigate("/admin/orders")} className="flex gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>

        <Button variant="outline" onClick={() => navigate("/admin/dashboard")} className="flex gap-2">
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <h1 className="text-2xl font-bold">🧾 Order Details</h1>

      <div className="space-y-4">
        <p>
          <strong>Customer:</strong> {order.user.name} ({order.user.email})
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={order.isDelivered ? "text-green-600" : "text-yellow-600"}>
            {order.isDelivered ? "Delivered" : "Pending"}
          </span>
        </p>
        <p>
          <strong>Total Amount:</strong> ₹{order.totalAmount}
        </p>
        <p>
          <strong>Ordered At:</strong> {format(new Date(order.createdAt), "PPPpp")}
        </p>
        {order.deliveredAt && (
          <p>
            <strong>Delivered At:</strong> {format(new Date(order.deliveredAt), "PPPpp")}
          </p>
        )}

        <div>
          <strong>Shipping Info:</strong>
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.address}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
            {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
          <p>📞 {order.shippingAddress.phone}</p>
        </div>

        <div>
          <strong>Items:</strong>
          <ul className="space-y-2 mt-2">
            {order.items.map((item) => (
              <li key={item._id} className="border p-3 rounded-md">
                <p className="font-medium">{item.name}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ₹{item.price}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetailsPage
