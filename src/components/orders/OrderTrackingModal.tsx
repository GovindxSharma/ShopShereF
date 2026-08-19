import { X, Truck, CheckCircle2, Clock, MapPin, Package, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

interface TrackingEvent {
  status: string
  title: string
  location?: string
  timestamp?: string
  description?: string
}

interface Props {
  open: boolean
  onClose: () => void
  order: any
}

export default function OrderTrackingModal({ open, onClose, order }: Props) {
  if (!open || !order) return null

  const trackingNumber =
    order.trackingNumber || `SS-EXP-${order._id.slice(-8).toUpperCase()}IN`
  const carrier = order.carrier || "ShopSphere Express Logistics"
  const isDelivered = order.isDelivered || order.orderStatus === "delivered"
  const isCancelled = order.orderStatus === "cancelled"

  // Standard real-world tracking steps
  const steps = [
    {
      key: "placed",
      title: "Order Placed & Confirmed",
      subtitle: "Payment verified, invoice generated",
      icon: <Package className="w-4 h-4" />,
      completed: true,
    },
    {
      key: "processing",
      title: "Packed & Quality Checked",
      subtitle: "Sealed in security packaging at Mumbai Hub",
      icon: <ShieldCheck className="w-4 h-4" />,
      completed: order.orderStatus !== "placed",
    },
    {
      key: "shipped",
      title: "In Transit with Courier",
      subtitle: `${carrier} · Dispatched to destination hub`,
      icon: <Truck className="w-4 h-4" />,
      completed: isDelivered || order.orderStatus === "shipped",
    },
    {
      key: "delivered",
      title: isDelivered ? "Delivered" : "Out for Delivery",
      subtitle: isDelivered
        ? `Delivered to ${order.shippingAddress?.city || "Destination"}`
        : "Expected by end of day",
      icon: <CheckCircle2 className="w-4 h-4" />,
      completed: isDelivered,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Truck className="w-3.5 h-3.5" /> Live Package Tracking
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
              AWB: <span className="font-mono text-primary">{trackingNumber}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Carrier: <strong className="text-foreground">{carrier}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Highlight Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${
            isCancelled
              ? "bg-red-500/10 border-red-500/20 text-red-600"
              : isDelivered
              ? "bg-green-500/10 border-green-500/20 text-green-600 font-bold"
              : "bg-blue-500/10 border-blue-500/20 text-blue-600 font-bold"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              {isCancelled
                ? "This order was cancelled."
                : isDelivered
                ? "Shipment Delivered"
                : "Shipment in Transit · On Schedule"}
            </span>
          </div>

          <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-full bg-card border text-foreground">
            {order.orderStatus}
          </span>
        </div>

        {/* Real-World Tracking Timeline */}
        {!isCancelled && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Journey Timeline
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Step Dot */}
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${
                      step.completed ? "bg-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.icon}
                  </div>

                  <div className="space-y-0.5">
                    <h4
                      className={`text-xs sm:text-sm font-bold ${
                        step.completed ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Event Log (Hub Updates) */}
        {order.trackingEvents && order.trackingEvents.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Hub Checkpoint Logs
            </h3>

            <div className="space-y-2 text-xs">
              {order.trackingEvents.map((evt: TrackingEvent, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-muted/20 border flex justify-between items-start gap-2"
                >
                  <div>
                    <p className="font-bold text-foreground">{evt.title}</p>
                    <p className="text-[11px] text-muted-foreground">{evt.description}</p>
                    {evt.location && (
                      <p className="text-[10px] text-primary font-medium mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span>{evt.location}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {evt.timestamp
                      ? format(new Date(evt.timestamp), "dd MMM, hh:mm a")
                      : "Recent"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Address Details */}
        <div className="p-3.5 rounded-2xl bg-muted/30 border text-xs space-y-1">
          <p className="font-bold text-foreground">Delivery Destination:</p>
          <p className="text-muted-foreground">
            {order.shippingAddress?.fullName} · {order.shippingAddress?.address},{" "}
            {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
            {order.shippingAddress?.postalCode}
          </p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <Button size="sm" onClick={onClose} className="rounded-xl px-6 text-xs font-bold">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
