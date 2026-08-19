// src/pages/ProfilePage.tsx
import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { logoutUser } from "@/redux/slices/authSlice"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Shield,
  Truck,
  Sparkles,
  KeyRound,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await dispatch(logoutUser()).unwrap()
      toast.success("Logged out successfully")
      navigate("/")
    } catch {
      toast.success("Logged out")
      navigate("/")
    } finally {
      setLoggingOut(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!oldPassword || !newPassword) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/auth/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Password updated successfully")
        setOldPassword("")
        setNewPassword("")
      } else {
        toast.error(data.message || "Password update failed")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your personal details and account security
          </p>
        </div>

        {/* Prominent Log Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20 rounded-xl gap-2 font-semibold shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>{loggingOut ? "Logging out..." : "Log Out"}</span>
        </Button>
      </div>

      {/* User Information Card */}
      <div className="bg-card border border-border/60 p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-border/50">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-xl font-black uppercase shrink-0 shadow-inner">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-foreground truncate">{user?.name}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 truncate mt-0.5">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-1">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
            <span className="text-xs text-muted-foreground block font-medium">Account Role</span>
            <div className="flex items-center gap-1.5 mt-1 font-semibold capitalize text-foreground">
              {user?.role === "admin" && <Sparkles className="w-4 h-4 text-amber-500" />}
              {user?.role === "delivery" && <Truck className="w-4 h-4 text-primary" />}
              {(!user?.role || user?.role === "user") && <Shield className="w-4 h-4 text-muted-foreground" />}
              <span>{user?.role || "Customer"}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 flex flex-col justify-center">
            <span className="text-xs text-muted-foreground block font-medium">Quick Actions</span>
            <div className="flex items-center gap-2 mt-1">
              {user?.role !== "delivery" && (
                <Link
                  to="/orders"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Package className="w-3.5 h-3.5" /> Orders
                </Link>
              )}
              {user?.role === "delivery" && (
                <Link
                  to="/delivery/dashboard"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Truck className="w-3.5 h-3.5" /> Delivery Run
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Update Card */}
      <div className="mt-8 bg-card border border-border/60 p-5 sm:p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <KeyRound className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Update Password</h2>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              Current Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full pl-3.5 pr-10 py-2.5 border border-border rounded-xl text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2.5 font-semibold shadow-xs"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}

