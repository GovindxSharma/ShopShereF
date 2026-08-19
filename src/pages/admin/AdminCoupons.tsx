import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  TicketPercent,
  Plus,
  Trash2,
  Power,
  Home,
  Calendar,
  Sparkles,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ConfirmModal from "@/components/common/ConfirmModal"

interface Coupon {
  _id: string
  code: string
  discountType: "percentage" | "flat"
  discountValue: number
  minPurchase: number
  maxDiscount?: number
  expiryDate: string
  isActive: boolean
  description: string
  createdAt: string
}

export default function AdminCouponsPage() {
  const navigate = useNavigate()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null)

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "flat",
    discountValue: 10,
    minPurchase: 499,
    maxDiscount: "",
    expiryDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    description: "",
    isActive: true,
  })

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/coupons/admin`, {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok && data.coupons) {
        setCoupons(data.coupons)
      } else {
        toast.error(data.message || "Failed to load coupons")
      }
    } catch {
      toast.error("Failed to load admin coupons")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code.trim()) {
      toast.error("Coupon code is required")
      return
    }

    setCreating(true)
    try {
      const res = await fetch(`${API_BASE}/coupons/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          code: formData.code.trim().toUpperCase(),
          maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(data.message)
        setShowCreateModal(false)
        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: 10,
          minPurchase: 499,
          maxDiscount: "",
          expiryDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
          description: "",
          isActive: true,
        })
        fetchCoupons()
      } else {
        toast.error(data.message || "Failed to create coupon")
      }
    } catch {
      toast.error("Error creating coupon")
    } finally {
      setCreating(false)
    }
  }

  const handleToggleStatus = async (couponId: string) => {
    setTogglingId(couponId)
    try {
      const res = await fetch(`${API_BASE}/coupons/admin/${couponId}/toggle`, {
        method: "PUT",
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(data.message)
        setCoupons((prev) =>
          prev.map((c) => (c._id === couponId ? { ...c, isActive: data.coupon.isActive } : c))
        )
      } else {
        toast.error(data.message || "Failed to toggle status")
      }
    } catch {
      toast.error("Error updating coupon status")
    } finally {
      setTogglingId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return

    setDeletingId(couponToDelete._id)
    try {
      const res = await fetch(`${API_BASE}/coupons/admin/${couponToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(data.message)
        setCoupons((prev) => prev.filter((c) => c._id !== couponToDelete._id))
        setCouponToDelete(null)
      } else {
        toast.error(data.message || "Failed to delete coupon")
      }
    } catch {
      toast.error("Error deleting coupon")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 min-h-[75vh]">
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
              Marketing
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <TicketPercent className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            Promo Coupons Manager
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Generate promotional discounts, set validity dates, and toggle active status
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCoupons}
            disabled={loading}
            className="rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 px-3 shrink-0"
            title="Refresh coupons list"
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
            <Home className="w-3.5 h-3.5" /> Dashboard
          </Button>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs flex-1 sm:flex-initial h-9 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Coupon</span>
          </Button>
        </div>
      </div>

      {/* Coupons Table / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border rounded-2xl p-4 sm:p-5 space-y-3 bg-card">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 border rounded-3xl bg-card p-6 sm:p-8 space-y-4">
          <TicketPercent className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
          <h3 className="text-lg font-bold">No Coupons Generated Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Create promotional codes for special discounts and festive offers.
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="rounded-xl text-xs font-bold">
            Create First Coupon
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {coupons.map((coupon) => {
            const isExpired = new Date(coupon.expiryDate) < new Date()

            return (
              <div
                key={coupon._id}
                className={`border rounded-3xl p-5 bg-card shadow-xs space-y-4 transition hover:shadow-md flex flex-col justify-between ${
                  !coupon.isActive || isExpired ? "opacity-70 bg-muted/20" : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="font-mono font-black text-base bg-primary/10 text-primary px-3 py-1 rounded-xl border border-primary/20 inline-block">
                        {coupon.code}
                      </span>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {coupon.description || "Promotional discount"}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isExpired
                          ? "bg-red-500/10 text-red-500"
                          : coupon.isActive
                          ? "bg-green-500/10 text-green-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {isExpired ? "Expired" : coupon.isActive ? "Active (ON)" : "Disabled (OFF)"}
                    </span>
                  </div>

                  {/* Coupon Details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <strong className="text-foreground">
                        {coupon.discountType === "flat"
                          ? `Flat ₹${coupon.discountValue}`
                          : `${coupon.discountValue}% OFF`}
                        {coupon.maxDiscount ? ` (Max ₹${coupon.maxDiscount})` : ""}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Min Purchase:</span>
                      <strong className="text-foreground">₹{coupon.minPurchase.toLocaleString()}</strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Valid Until:</span>
                      <strong className="text-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {coupon.expiryDate ? format(new Date(coupon.expiryDate), "dd MMM yyyy") : "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Toggle ON/OFF & Delete */}
                <div className="flex items-center gap-2 pt-3 border-t">
                  <Button
                    size="sm"
                    variant={coupon.isActive ? "outline" : "default"}
                    disabled={togglingId === coupon._id}
                    onClick={() => handleToggleStatus(coupon._id)}
                    className={`flex-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      coupon.isActive
                        ? "text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {coupon.isActive ? "Turn OFF" : "Turn ON"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCouponToDelete(coupon)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Generate Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border/80 p-4 sm:p-6 rounded-3xl w-full max-w-lg shadow-2xl space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="border-b pb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Generate New Promo Coupon
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set discount rules, minimum order values, and expiry date
              </p>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              {/* Code */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Coupon Code *</label>
                <input
                  required
                  placeholder="e.g. FESTIVE25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full border rounded-xl px-3.5 py-2 font-mono font-bold uppercase bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "flat",
                      })
                    }
                    className="w-full border rounded-xl px-3 py-2 bg-background font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Amount (₹ OFF)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    {formData.discountType === "percentage" ? "Percentage (% Value)" : "Flat Amount (₹ Value)"} *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full border rounded-xl px-3.5 py-2 bg-background font-bold focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Min Purchase Required (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                    className="w-full border rounded-xl px-3.5 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Optional (e.g. 1000)"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full border rounded-xl px-3.5 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Validity Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full border rounded-xl px-3.5 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Description / Banner Text</label>
                <input
                  placeholder="e.g. 25% off on all festive orders above ₹999"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-xl px-3.5 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={creating}
                  className="rounded-xl text-xs font-bold shadow-xs"
                >
                  {creating ? "Generating..." : "Generate Coupon"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Built-in Delete Confirm Modal */}
      <ConfirmModal
        open={Boolean(couponToDelete)}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon '${couponToDelete?.code}'? Shoppers will no longer be able to use this code.`}
        confirmText="Delete Coupon"
        cancelText="Cancel"
        variant="destructive"
        loading={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCouponToDelete(null)}
      />
    </div>
  )
}
