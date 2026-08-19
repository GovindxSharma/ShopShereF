import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  Eye,
  Home,
  Search,
  RefreshCw,
  Package,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Order {
  _id: string
  user: { name: string; email: string }
  totalAmount: number
  isDelivered: boolean
  orderStatus?: string
  paymentStatus?: string
  createdAt: string
  deliveredAt?: string
}

const AdminOrdersPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/orders`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch orders")
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : data.orders || [])
    } catch {
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      const data = await res.json()

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...data.order } : o))
      )

      toast.success(`Order status updated to ${newStatus}`)
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdating(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" ||
      order.orderStatus === filterStatus ||
      (filterStatus === "delivered" && order.isDelivered)

    const matchesSearch =
      !searchTerm ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const placedCount = orders.filter((o) => o.orderStatus === "placed" || (!o.orderStatus && !o.isDelivered)).length
  const processingCount = orders.filter((o) => o.orderStatus === "processing").length
  const shippedCount = orders.filter((o) => o.orderStatus === "shipped").length
  const deliveredCount = orders.filter((o) => o.isDelivered || o.orderStatus === "delivered").length

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center border-b pb-5">
        <div className="space-y-1.5">
          {/* Breadcrumb & Navigation */}
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
              Fulfillment
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Customer Orders Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            View orders, transition dispatch states, and track fulfillment metrics
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            disabled={loading}
            className="rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 px-3 shrink-0"
            title="Refresh orders list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
            className="rounded-xl text-xs hidden sm:flex items-center gap-1.5 font-semibold h-9 px-3.5"
          >
            <Home className="w-3.5 h-3.5" /> Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Total Orders</span>
          <p className="text-xl sm:text-2xl font-black text-foreground">{orders.length}</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Processing / Placed</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {placedCount + processingCount}
          </p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">In Transit</span>
          <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{shippedCount}</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Delivered</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{deliveredCount}</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-card p-3.5 sm:p-4 rounded-2xl border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden py-1">
          {[
            { id: "all", label: "All" },
            { id: "placed", label: "Placed" },
            { id: "processing", label: "Processing" },
            { id: "shipped", label: "Shipped" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
                filterStatus === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "hover:bg-muted text-muted-foreground bg-card border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border bg-card space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 border rounded-3xl bg-card p-8 space-y-4">
          <Package className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
          <h3 className="text-lg font-bold text-foreground">No Orders Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchTerm || filterStatus !== "all"
              ? "No customer orders matched your active search query or filter."
              : "No customer orders have been placed yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {filteredOrders.map((order) => {
            const currentStatus = order.orderStatus || (order.isDelivered ? "delivered" : "processing")
            const isDelivered = currentStatus === "delivered"
            const isCancelled = currentStatus === "cancelled"

            return (
              <div
                key={order._id}
                className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border bg-card shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <h3 className="font-bold text-sm text-foreground truncate">
                        {order.user?.name || "Guest Customer"}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.user?.email || "N/A"}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                        isDelivered
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                          : isCancelled
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : currentStatus === "shipped"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Order Total:</span>
                      <span className="text-base font-black text-foreground">
                        ₹{order.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                      <span>Placed:</span>
                      <span>{order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy") : "Recent"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-3">
                  {/* Status Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Transition Status
                    </label>
                    <select
                      value={currentStatus}
                      disabled={updating === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="w-full border rounded-xl px-3 py-1.5 bg-muted/20 font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-xs"
                    >
                      <option value="placed">Placed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Invoice & Details
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
