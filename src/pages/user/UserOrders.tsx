import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { fetchUserOrders, cancelUserOrder } from "@/redux/slices/orderSlice"
import { toast } from "sonner"
import { format } from "date-fns"
import Loader from "@/components/common/Loader"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
  Package,
  Truck,
  CheckCircle2,
  Printer,
  XCircle,
  ShoppingBag,
  ArrowRight,
  ReceiptText,
} from "lucide-react"
import type { Order } from "@/types/order"

import ConfirmModal from "@/components/common/ConfirmModal"
import OrderTrackingModal from "@/components/orders/OrderTrackingModal"

export default function UserOrdersPage() {
  const dispatch = useAppDispatch()
  const { userOrders, loading, error } = useAppSelector((state) => state.order)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null)
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchUserOrders())
  }, [dispatch])

  const handleCancelOrder = async () => {
    if (!orderToCancel) return

    try {
      setCancellingId(orderToCancel)
      await dispatch(cancelUserOrder(orderToCancel)).unwrap()
      toast.success("Order cancelled successfully and stock refunded!")
      dispatch(fetchUserOrders())
      setOrderToCancel(null)
    } catch (err: any) {
      toast.error(err || "Failed to cancel order")
    } finally {
      setCancellingId(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-28">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <p className="text-red-500 font-bold">Error loading orders: {error}</p>
        <Button onClick={() => dispatch(fetchUserOrders())}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8 min-h-[75vh]">
      {/* Top Title */}
      <div className="border-b pb-4 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-primary" />
            My Order History
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track current deliveries, view invoices, and manage past purchases
          </p>
        </div>

        <Link to="/products">
          <Button variant="outline" size="sm" className="rounded-xl">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {!userOrders || userOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-5 border rounded-3xl bg-card p-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">No Orders Placed Yet</h2>
          <p className="text-muted-foreground max-w-md text-sm">
            You haven’t placed any orders with ShopSphere yet. Browse our catalog to find exciting products!
          </p>
          <Link to="/products">
            <Button size="lg" className="rounded-full px-8 flex items-center gap-2">
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => {
            const isCancelled = order.orderStatus === "cancelled"
            const isDelivered = order.isDelivered || order.orderStatus === "delivered"

            return (
              <div
                key={order._id}
                className="border rounded-2xl p-6 space-y-6 bg-card shadow-xs hover:shadow-md transition"
              >
                {/* Header Information Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isCancelled
                            ? "bg-red-500/10 text-red-500"
                            : isDelivered
                            ? "bg-green-500/10 text-green-600"
                            : "bg-blue-500/10 text-blue-600"
                        }`}
                      >
                        {order.orderStatus || (isDelivered ? "Delivered" : "Processing")}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Placed on:{" "}
                      {order.createdAt
                        ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")
                        : "Recent"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      size="sm"
                      onClick={() => setSelectedTrackingOrder(order)}
                      className="rounded-xl text-xs flex items-center gap-1.5 font-bold shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" /> Track Package
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <ReceiptText className="w-3.5 h-3.5" /> View Invoice
                    </Button>

                    {!isDelivered && !isCancelled && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={cancellingId === order._id}
                        onClick={() => setOrderToCancel(order._id)}
                        className="rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Visual Progress Stepper */}
                {!isCancelled ? (
                  <div className="py-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground relative">
                      {/* Step 1: Placed */}
                      <div className="flex flex-col items-center z-10">
                        <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                          ✓
                        </div>
                        <span className="font-semibold text-foreground mt-1">Placed</span>
                      </div>

                      {/* Step 2: Confirmed / Paid */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                            order.paymentStatus === "paid"
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {order.paymentStatus === "paid" ? "✓" : "2"}
                        </div>
                        <span className="font-semibold mt-1">
                          {order.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                        </span>
                      </div>

                      {/* Step 3: Shipped / Processing */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                            isDelivered || order.orderStatus === "shipped"
                              ? "bg-green-500 text-white"
                              : "bg-primary text-primary-foreground animate-pulse"
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold mt-1">In Transit</span>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className="flex flex-col items-center z-10">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                            isDelivered
                              ? "bg-green-500 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="font-semibold mt-1">
                          {isDelivered ? "Delivered" : "Expected Soon"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-600 text-xs font-semibold flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> This order was cancelled. Any processed payment has been refunded.
                  </div>
                )}

                {/* Items in Order */}
                <div className="space-y-3 divide-y divide-border/40">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pt-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.image ||
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop"
                          }
                          alt={item.name}
                          className="w-12 h-12 object-contain rounded-xl bg-muted/40 p-1 border"
                        />
                        <div>
                          <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-foreground">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer: Shipping Address & Total */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-t pt-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-bold text-foreground block mb-0.5">
                      Shipping Destination:
                    </span>
                    <p>
                      {order.shippingAddress?.fullName || "Customer"}, {order.shippingAddress?.address || "Address"},{" "}
                      {order.shippingAddress?.city || ""}, {order.shippingAddress?.state || ""} -{" "}
                      {order.shippingAddress?.postalCode || ""}
                    </p>
                    <p className="mt-0.5">Phone: {order.shippingAddress?.phone || "N/A"}</p>
                  </div>

                  <div className="text-right sm:text-right">
                    <p className="text-xs text-muted-foreground">Grand Total</p>
                    <p className="text-xl font-black text-primary">
                      ₹{(order.totalAmount ?? order.totalPrice ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 🧾 Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border shadow-2xl rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Invoice Top Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-primary">
                  ShopSphere Receipt
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tax Invoice & Proof of Purchase
                </p>
              </div>

              <div className="text-right text-xs text-muted-foreground">
                <p className="font-bold text-foreground">
                  Order #{selectedInvoiceOrder._id.slice(-8).toUpperCase()}
                </p>
                <p>
                  Date:{" "}
                  {selectedInvoiceOrder.createdAt
                    ? format(new Date(selectedInvoiceOrder.createdAt), "dd MMM yyyy")
                    : "Recent"}
                </p>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-foreground block mb-1">Billed & Shipped To:</span>
                <p className="font-semibold">{selectedInvoiceOrder.shippingAddress.fullName}</p>
                <p>{selectedInvoiceOrder.shippingAddress.address}</p>
                <p>
                  {selectedInvoiceOrder.shippingAddress.city},{" "}
                  {selectedInvoiceOrder.shippingAddress.state} -{" "}
                  {selectedInvoiceOrder.shippingAddress.postalCode}
                </p>
                <p>Phone: {selectedInvoiceOrder.shippingAddress.phone}</p>
              </div>

              <div className="text-right">
                <span className="font-bold text-foreground block mb-1">Payment Status:</span>
                <p className="font-semibold uppercase text-green-600">
                  {selectedInvoiceOrder.paymentStatus}
                </p>
                <p className="text-muted-foreground">
                  Method: {selectedInvoiceOrder.paymentMethod || "Electronic Transfer"}
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {selectedInvoiceOrder.items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-medium">{item.name}</td>
                      <td className="p-2.5 text-center">{item.quantity}</td>
                      <td className="p-2.5 text-right">₹{item.price?.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-bold">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Calculation */}
            <div className="space-y-1.5 text-xs text-right border-t pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery:</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between font-black text-sm text-foreground pt-1 border-t">
                <span>Grand Total Paid:</span>
                <span className="text-primary text-base">
                  ₹{(selectedInvoiceOrder.totalAmount ?? selectedInvoiceOrder.totalPrice ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoiceOrder(null)}
                className="rounded-xl"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                className="rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Built-in Order Cancellation Confirmation Modal */}
      <ConfirmModal
        open={Boolean(orderToCancel)}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? Item inventory stock will be restored automatically."
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order"
        variant="destructive"
        loading={Boolean(cancellingId)}
        onConfirm={handleCancelOrder}
        onCancel={() => setOrderToCancel(null)}
      />

      {/* Live Package Tracking Modal */}
      <OrderTrackingModal
        open={Boolean(selectedTrackingOrder)}
        onClose={() => setSelectedTrackingOrder(null)}
        order={selectedTrackingOrder}
      />
    </div>
  )
}
