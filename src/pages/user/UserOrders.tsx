import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchUserOrders } from "@/redux/slices/orderSlice";
import { toast } from "sonner";
import { format } from "date-fns";
import Loader from "@/components/common/Loader"

export default function UserOrdersPage() {
  const dispatch = useAppDispatch();
  const { userOrders, loading, error } = useAppSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (loading) return <p className="text-center text-sm text-muted-foreground"><Loader/></p>;

  if (error) {
    toast.error(error);
    return <p className="text-center text-red-500 dark:text-red-400 mt-4">Error loading orders</p>;
  }

  if (!userOrders || userOrders.length === 0) {
    return <p className="text-center mt-4 text-muted-foreground">You haven’t placed any orders yet.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-2xl font-bold text-foreground mb-4">My Orders</h1>

      {userOrders.map((order) => (
        <div
          key={order._id}
          className="border rounded-xl shadow-sm p-6 space-y-4 bg-white dark:bg-zinc-900"
        >
          {/* Order Meta Info */}
          <div className="flex justify-between items-start text-sm flex-wrap gap-2">
            <div>
              <p className="font-semibold text-foreground">Order ID: {order._id}</p>
              {order.createdAt && (
                <p className="text-muted-foreground">
                  Ordered on: {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
                </p>
              )}
              {order.paidAt && (
                <p className="text-green-700 dark:text-green-400 text-xs">
                  Paid on: {format(new Date(order.paidAt), "dd MMM yyyy, hh:mm a")}
                </p>
              )}
              {order.deliveredAt && (
                <p className="text-blue-600 dark:text-blue-400 text-xs">
                  Delivered on: {format(new Date(order.deliveredAt), "dd MMM yyyy")}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 text-xs">
              <span
                className={`px-2 py-1 rounded-full ${
                  order.paymentStatus === "paid"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                }`}
              >
                {order.paymentStatus === "paid" ? "Paid" : "Pending"}
              </span>
              <span
                className={`px-2 py-1 rounded-full ${
                  order.isDelivered
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300"
                }`}
              >
                {order.isDelivered ? "Delivered" : "Processing"}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 text-sm">
            {order.items.map((item) => (
              <div
                key={item.product}
                className="flex items-center gap-4 border rounded p-2 dark:border-zinc-700"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-contain rounded border dark:border-zinc-700"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/60x60?text=Image")
                  }
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          <div className="text-sm text-muted-foreground border-t pt-3 dark:border-zinc-700">
            <p className="font-medium text-foreground">Shipping To:</p>
            <p>
              {order.shippingAddress.fullName}, {order.shippingAddress.address},{" "}
              {order.shippingAddress.city}, {order.shippingAddress.state},{" "}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          {/* Total */}
          <div className="text-right text-lg font-semibold text-primary pt-2">
            Total: ₹{order.totalAmount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
