import { useEffect, useState } from "react"
import { useAppSelector } from "@/redux/hooks"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  Truck,
  Package,
  MapPin,
  CheckCircle2,
  User,
  Phone,
  Navigation,
  RefreshCw,
  Search,
  Home,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import OrderTrackingModal from "@/components/orders/OrderTrackingModal"

interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
}

interface Order {
  _id: string
  trackingNumber?: string
  carrier?: string
  user: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  shippingAddress: {
    fullName?: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
    phone?: string
  }
  paymentMethod: string
  paymentStatus: string
  totalAmount?: number
  totalPrice?: number
  orderStatus: string
  isDelivered: boolean
  createdAt: string
  deliveredAt?: string
  items: OrderItem[]
  trackingEvents?: any[]
}

export default function DeliveryDashboardPage() {
  const { user } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"active" | "all" | "shipped" | "delivered">("active")
  const [searchQuery, setSearchQuery] = useState("")

  // Modals state
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null)
  const [actionOrder, setActionOrder] = useState<Order | null>(null)
  const [targetStatus, setTargetStatus] = useState<string | null>(null)
  const [statusNote, setStatusNote] = useState("")
  const [updating, setUpdating] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/delivery/orders`, {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok && data.orders) {
        setOrders(data.orders)
      } else {
        toast.error(data.message || "Failed to load shipments")
      }
    } catch {
      toast.error("Network error while loading shipments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleUpdateStatus = async () => {
    if (!actionOrder || !targetStatus) return

    setUpdating(true)
    try {
      const res = await fetch(`${API_BASE}/delivery/orders/${actionOrder._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: targetStatus,
          note: statusNote.trim() || undefined,
          location: `${actionOrder.shippingAddress?.city || "Regional Hub"}, ${actionOrder.shippingAddress?.state || "IN"}`,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(data.message)
        setActionOrder(null)
        setTargetStatus(null)
        setStatusNote("")
        fetchOrders()
      } else {
        toast.error(data.message || "Failed to update shipment")
      }
    } catch {
      toast.error("Error updating shipment status")
    } finally {
      setUpdating(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    // Search query
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress?.city?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    // Tab filter
    if (filter === "active") {
      return !order.isDelivered && order.orderStatus !== "cancelled"
    }
    if (filter === "shipped") {
      return order.orderStatus === "shipped" && !order.isDelivered
    }
    if (filter === "delivered") {
      return order.isDelivered || order.orderStatus === "delivered"
    }
    return true
  })

  const activeCount = orders.filter((o) => !o.isDelivered && o.orderStatus !== "cancelled").length
  const deliveredCount = orders.filter((o) => o.isDelivered || o.orderStatus === "delivered").length

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center border-b pb-5">
        <div className="space-y-1.5">
          {user?.role === "admin" ? (
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                Logistics
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5" /> Logistics & Delivery Hub
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {user?.name || "Delivery Partner"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage dispatches, update live transit milestones, and record customer doorstep handovers
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            onClick={fetchOrders}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 px-3 shrink-0"
            title="Refresh shipments"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Shipments</span>
          </Button>

          {user?.role === "admin" && (
            <Button
              onClick={() => navigate("/admin/dashboard")}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs hidden sm:flex items-center gap-1.5 font-semibold h-9 px-3.5"
            >
              <Home className="w-3.5 h-3.5" /> Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Active Shipments</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{activeCount}</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Delivered</span>
          <p className="text-xl sm:text-2xl font-black text-green-600">{deliveredCount}</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border bg-card shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Total Managed</span>
          <p className="text-xl sm:text-2xl font-black text-primary">{orders.length}</p>
        </div>
      </div>

      {/* Controls: Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter("active")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              filter === "active"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Pending Delivery ({activeCount})
          </button>

          <button
            onClick={() => setFilter("shipped")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              filter === "shipped"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            In Transit
          </button>

          <button
            onClick={() => setFilter("delivered")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              filter === "delivered"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Delivered ({deliveredCount})
          </button>

          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              filter === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            All Packages ({orders.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search AWB or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-2xl p-5 bg-card space-y-3">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 border rounded-3xl bg-card p-8 space-y-3">
          <Package className="w-10 h-10 text-muted-foreground mx-auto stroke-1" />
          <h3 className="text-base font-bold">No Shipments Found</h3>
          <p className="text-xs text-muted-foreground">
            {filter === "active"
              ? "All packages have been successfully delivered!"
              : "No orders match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isDelivered = order.isDelivered || order.orderStatus === "delivered"
            const isShipped = order.orderStatus === "shipped"

            return (
              <div
                key={order._id}
                className="border rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-card shadow-2xs space-y-4 transition hover:border-primary/40"
              >
                {/* Top Row: AWB & Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3.5 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-foreground">
                        {order.trackingNumber || `SS-EXP-${order._id.slice(-8).toUpperCase()}`}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isDelivered
                            ? "bg-green-500/10 text-green-600"
                            : isShipped
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Carrier: {order.carrier || "ShopSphere Express Logistics"} · Booked on{" "}
                      {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a") : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="font-extrabold text-foreground text-sm">
                      ₹{(order.totalAmount ?? order.totalPrice ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-muted text-muted-foreground">
                      {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>
                </div>

                {/* Middle Grid: Customer & Delivery Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Customer Info */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/30 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <User className="w-3.5 h-3.5 text-primary" />
                        <span>{order.shippingAddress?.fullName || order.user?.name || "Customer"}</span>
                      </div>
                      {(order.shippingAddress?.phone || order.user?.phone) && (
                        <a
                          href={`tel:${order.shippingAddress?.phone || order.user?.phone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline px-2 py-0.5 rounded-lg bg-primary/10"
                        >
                          <Phone className="w-3 h-3" /> Call Customer
                        </a>
                      )}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      <span>{order.user?.email}</span>
                      {(order.shippingAddress?.phone || order.user?.phone) && (
                        <span> · {order.shippingAddress?.phone || order.user?.phone}</span>
                      )}
                    </div>
                  </div>

                  {/* Destination Address */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/30 border">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <div className="text-foreground font-medium text-[11px] leading-relaxed">
                        <span>{order.shippingAddress?.address}, </span>
                        <span className="font-bold">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                          {order.shippingAddress?.postalCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Package Items: </span>
                  {order.items.map((it) => `${it.name} (×${it.quantity})`).join(", ")}
                </div>

                {/* Bottom Actions: Quick Milestones */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTrackingOrder(order)}
                    className="rounded-xl text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Navigation className="w-3.5 h-3.5" /> View Live Timeline
                  </Button>

                  <div className="flex flex-wrap items-center gap-2">
                    {!isDelivered && (
                      <>
                        {order.orderStatus === "placed" || order.orderStatus === "processing" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setActionOrder(order)
                              setTargetStatus("shipped")
                              setStatusNote("Dispatched from warehouse hub. In transit to destination.")
                            }}
                            className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" /> Dispatch (In Transit)
                          </Button>
                        ) : null}

                        <Button
                          size="sm"
                          onClick={() => {
                            setActionOrder(order)
                            setTargetStatus("out_for_delivery")
                            setStatusNote("Package out for delivery with courier agent.")
                          }}
                          className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5" /> Out for Delivery
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            setActionOrder(order)
                            setTargetStatus("delivered")
                            setStatusNote("Successfully handed over to recipient.")
                          }}
                          className="rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
                        </Button>
                      </>
                    )}

                    {isDelivered && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 px-3 py-1 bg-green-500/10 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Delivery Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation & Note Modal */}
      {actionOrder && targetStatus && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Confirm Milestone Update
              </h3>
              <p className="text-xs text-muted-foreground">
                Set status to <strong className="uppercase text-primary">{targetStatus}</strong> for AWB{" "}
                <span className="font-mono font-bold">
                  {actionOrder.trackingNumber || actionOrder._id.slice(-8)}
                </span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Checkpoint Description / Note:</label>
              <textarea
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add checkpoint remarks (e.g. Handed over at security gate)..."
                className="w-full border rounded-xl p-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionOrder(null)
                  setTargetStatus(null)
                }}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={updating}
                onClick={handleUpdateStatus}
                className="rounded-xl text-xs font-bold shadow-xs"
              >
                {updating ? "Updating..." : "Confirm & Save Checkpoint"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Timeline Modal Preview */}
      <OrderTrackingModal
        open={Boolean(selectedTrackingOrder)}
        onClose={() => setSelectedTrackingOrder(null)}
        order={selectedTrackingOrder}
      />
    </div>
  )
}
