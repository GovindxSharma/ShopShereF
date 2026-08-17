import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"
import { Eye, Home, Search } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 min-h-[75vh]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Customer Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            View, track deliveries, and manage status transitions
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate("/admin/dashboard")}
          className="flex gap-2 items-center rounded-xl"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-hidden">
          {["all", "placed", "processing", "shipped", "delivered", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
                  filterStatus === status
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-6 w-full" />
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-2xl p-8 bg-card">
          <p className="font-semibold text-base">No orders found.</p>
          <p className="text-xs mt-1">Try switching tabs or adjusting search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const currentStatus = order.orderStatus || (order.isDelivered ? "delivered" : "processing")

            return (
              <Card key={order._id} className="hover:shadow-md transition rounded-2xl border">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-bold truncate max-w-[180px]">
                      {order.user?.name || "Guest Customer"}
                    </CardTitle>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        currentStatus === "delivered"
                          ? "bg-green-500/10 text-green-600"
                          : currentStatus === "cancelled"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="text-muted-foreground truncate">
                    Email: {order.user?.email || "N/A"}
                  </p>

                  <p className="text-muted-foreground">
                    Total: <strong className="text-foreground text-sm font-bold">₹{order.totalAmount?.toLocaleString()}</strong>
                  </p>

                  <p className="text-muted-foreground">
                    Placed: {order.createdAt ? format(new Date(order.createdAt), "PPP") : "Recent"}
                  </p>

                  {/* Status Dropdown */}
                  <div className="pt-2 border-t space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      Update Order Status:
                    </label>
                    <select
                      value={currentStatus}
                      disabled={updating === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="w-full border rounded-xl px-2.5 py-1.5 bg-muted/40 font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-xs"
                    >
                      <option value="placed">Placed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
