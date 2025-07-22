import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"
import { CheckCircle2, Eye, Truck, Home } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Order {
  _id: string
  user: { name: string }
  totalAmount: number
  isDelivered: boolean
  createdAt: string
  deliveredAt?: string
}

const AdminOrdersPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch orders")
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : data.orders || [])
      } catch (error) {
        toast.error("Failed to load orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleMarkAsDelivered = async (orderId: string) => {
    setUpdating(orderId)
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/deliver`, {
        method: "PUT",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to mark as delivered")

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, isDelivered: true, deliveredAt: new Date().toISOString() }
            : order
        )
      )

      toast.success("Order marked as delivered")
    } catch (error) {
      toast.error("Failed to update delivery status")
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">🧾 All Orders</h1>
          <p className="text-muted-foreground text-sm">View and manage all customer orders</p>
        </div>

        <Button variant="outline" onClick={() => navigate("/admin/dashboard")} className="flex gap-2">
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Button>
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
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground">No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {order.user?.name || "Unknown User"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Status:{" "}
                  <span className={order.isDelivered ? "text-green-600" : "text-yellow-600"}>
                    {order.isDelivered ? "Delivered" : "Pending"}
                  </span>
                </p>

                <p className="text-sm text-muted-foreground">
                  Total: ₹{order.totalAmount.toLocaleString()}
                </p>

                <p className="text-sm text-muted-foreground">
                  Placed on: {format(new Date(order.createdAt), "PPP")}
                </p>

                {order.isDelivered && order.deliveredAt && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Delivered on {format(new Date(order.deliveredAt), "PPP")}
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Order
                  </Button>

                  {!order.isDelivered && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsDelivered(order._id)}
                      disabled={updating === order._id}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      {updating === order._id ? "Updating..." : "Mark as Delivered"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminOrdersPage
