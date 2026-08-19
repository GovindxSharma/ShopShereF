import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
} from "lucide-react"
import { toast } from "sonner"
import Loader from "@/components/common/Loader"

interface OrderDetail {
  _id: string
  user: { name: string; email: string }
  items: {
    _id: string
    name: string
    image?: string
    price: number
    quantity: number
  }[]
  totalAmount: number
  isDelivered: boolean
  orderStatus?: string
  paymentMethod?: string
  paymentStatus?: string
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
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/orders/admin/${id}`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch order")
        const data = await res.json()
        setOrder(data)
      } catch (err) {
        toast.error("Could not load order details")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-28">
        <Loader />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <p className="text-muted-foreground font-semibold">Order not found.</p>
        <Button onClick={() => navigate("/admin/orders")}>Back to Orders</Button>
      </div>
    )
  }

  const isDelivered = order.isDelivered || order.orderStatus === "delivered"

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 min-h-[80vh]">
      {/* Navigation Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center border-b pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
              className="rounded-xl text-xs text-muted-foreground hover:text-foreground -ml-2.5 h-7 px-2 flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Button>
            <span className="text-muted-foreground/30 text-xs">/</span>
            <button
              onClick={() => navigate("/admin/orders")}
              className="text-xs text-muted-foreground hover:text-foreground font-semibold hover:underline"
            >
              Orders
            </button>
            <span className="text-muted-foreground/30 text-xs">/</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 font-mono">
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Placed on {order.createdAt ? format(new Date(order.createdAt), "PPP 'at' p") : "N/A"}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/orders")}
            className="rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 px-3.5 flex-1 sm:flex-initial font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Orders List</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
            className="rounded-xl text-xs hidden sm:flex items-center gap-1.5 font-semibold h-9 px-3.5"
          >
            <Home className="w-3.5 h-3.5" /> Dashboard
          </Button>
        </div>
      </div>

      {/* Status & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Customer Info Card */}
        <div className="p-5 rounded-3xl border bg-card shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <User className="w-4 h-4 text-primary" /> Customer Info
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-bold text-foreground">{order.user?.name || "Guest Customer"}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" /> {order.user?.email || "N/A"}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="p-5 rounded-3xl border bg-card shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Truck className="w-4 h-4 text-primary" /> Fulfillment Status
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  isDelivered
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}
              >
                {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{order.orderStatus || (isDelivered ? "Delivered" : "Processing")}</span>
              </span>
            </div>
            {order.deliveredAt && (
              <p className="text-xs text-muted-foreground">
                Delivered: {format(new Date(order.deliveredAt), "dd MMM yyyy, p")}
              </p>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-5 rounded-3xl border bg-card shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <CreditCard className="w-4 h-4 text-primary" /> Payment Summary
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-foreground">
              ₹{order.totalAmount?.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              Method: {order.paymentMethod || "Online"} · Status: {order.paymentStatus || "Paid"}
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Details & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping Address */}
        <div className="p-6 rounded-3xl border bg-card shadow-xs space-y-4 lg:col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Delivery Destination
          </h2>

          <div className="space-y-2 text-xs leading-relaxed text-muted-foreground border-t pt-3">
            <p className="font-bold text-sm text-foreground">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
            </p>
            <p>{order.shippingAddress?.country}</p>
            {order.shippingAddress?.phone && (
              <p className="flex items-center gap-1.5 text-foreground font-semibold pt-1">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>{order.shippingAddress.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="p-6 rounded-3xl border bg-card shadow-xs space-y-4 lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> Order Items ({order.items?.length || 0})
          </h2>

          <div className="divide-y divide-border/40 border-t">
            {order.items?.map((item) => (
              <div key={item._id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted/40 p-1 border flex items-center justify-center shrink-0">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150&auto=format&fit=crop"}
                      alt={item.name}
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=150&auto=format&fit=crop"
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetailsPage
