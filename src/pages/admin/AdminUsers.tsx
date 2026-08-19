import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Trash2,
  Home,
  UserRound,
  Search,
  Sparkles,
  Truck,
  Shield,
  RefreshCw,
  Mail,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ConfirmModal from "@/components/common/ConfirmModal"

interface User {
  _id: string
  name: string
  email: string
  role: "user" | "delivery" | "admin"
  createdAt?: string
}

const AdminUsers = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/admin/users`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      toast.error("Failed to load users.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    try {
      setDeleting(true)
      const res = await fetch(`${API_BASE}/admin/users/${userToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to delete user")
      setUsers((prev) => prev.filter((user) => user._id !== userToDelete._id))
      toast.success("User account deleted successfully")
      setUserToDelete(null)
    } catch {
      toast.error("Error deleting user account")
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || (user.role || "user") === roleFilter

    return matchesSearch && matchesRole
  })

  const adminCount = users.filter((u) => u.role === "admin").length
  const deliveryCount = users.filter((u) => u.role === "delivery").length
  const customerCount = users.filter((u) => !u.role || u.role === "user").length

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 min-h-[80vh]">
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
              Users
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Registered Users Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Inspect all registered accounts, view permissions, and moderate user access
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 px-3 shrink-0"
            title="Refresh users list"
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
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Total Accounts</span>
          <p className="text-xl sm:text-2xl font-black text-foreground">{users.length}</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Customers</span>
          <p className="text-xl sm:text-2xl font-black text-primary">{customerCount}</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Delivery Partners</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{deliveryCount}</p>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground">Admins</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{adminCount}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-card p-3.5 sm:p-4 rounded-2xl border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden py-1">
          {[
            { id: "all", label: "All Users" },
            { id: "user", label: "Customers" },
            { id: "delivery", label: "Delivery" },
            { id: "admin", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
                roleFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "hover:bg-muted text-muted-foreground bg-card border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border bg-card space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 border rounded-3xl bg-card p-8 space-y-4">
          <UserRound className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
          <h3 className="text-lg font-bold text-foreground">No Users Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchTerm || roleFilter !== "all"
              ? "No registered user accounts matched your search or role filter."
              : "No user accounts are currently registered."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((user) => {
            const isAdmin = user.role === "admin"
            const isDelivery = user.role === "delivery"

            return (
              <div
                key={user._id}
                className="p-5 rounded-2xl border bg-card shadow-xs hover:shadow-md transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center text-base font-black uppercase shrink-0">
                    {user.name?.charAt(0) || "U"}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-foreground truncate">{user.name}</h3>
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                          isAdmin
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : isDelivery
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {isAdmin && <Sparkles className="w-3 h-3" />}
                        {isDelivery && <Truck className="w-3 h-3" />}
                        {!isAdmin && !isDelivery && <Shield className="w-3 h-3" />}
                        <span>{user.role || "Customer"}</span>
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {!isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUserToDelete(user)}
                    className="rounded-xl p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        open={Boolean(userToDelete)}
        title="Delete User Account"
        message={`Are you sure you want to delete the account for "${userToDelete?.name}" (${userToDelete?.email})? This action cannot be undone.`}
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  )
}

export default AdminUsers
