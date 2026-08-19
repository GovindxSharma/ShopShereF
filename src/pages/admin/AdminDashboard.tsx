import { useEffect, useState } from "react"
import { useAppDispatch } from "@/redux/hooks"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import {
  Box,
  PackageSearch,
  UserRound,
  IndianRupee,
  TicketPercent,
  Truck,
  Sparkles,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Analytics {
  totalRevenue: number
  totalOrders: number
}

const AdminDashboard = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Analytics | null>(null)
  const [productCount, setProductCount] = useState<number | null>(null)
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, productRes, userRes] = await Promise.all([
        fetch(`${API_BASE}/orders/admin/analytics`, { credentials: "include" }),
        fetch(`${API_BASE}/products`, { credentials: "include" }),
        fetch(`${API_BASE}/admin/users`, { credentials: "include" }),
      ])

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setStats(analyticsData)
      }
      if (productRes.ok) {
        const productData = await productRes.json()
        setProductCount(productData.total)
      }
      if (userRes.ok) {
        const userData = await userRes.json()
        setTotalUsers(userData.total)
      }
    } catch {
      toast.error("Failed to load dashboard metrics.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [dispatch])

  const metrics = [
    {
      label: "Total Gross Revenue",
      value: stats?.totalRevenue ? `₹${stats.totalRevenue.toLocaleString()}` : "₹0",
      icon: <IndianRupee className="w-5 h-5 text-emerald-500" />,
      badge: "Lifetime Sales",
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Customer Orders",
      value: stats?.totalOrders ?? 0,
      icon: <PackageSearch className="w-5 h-5 text-blue-500" />,
      badge: "Completed & Active",
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      label: "Catalog Products",
      value: productCount ?? 0,
      icon: <Box className="w-5 h-5 text-amber-500" />,
      badge: "Live in Store",
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      label: "Registered Users",
      value: totalUsers ?? 0,
      icon: <UserRound className="w-5 h-5 text-purple-500" />,
      badge: "Accounts",
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ]

  const managementModules = [
    {
      label: "Manage Products",
      description: "Add new items, update inventory pricing, and manage stock levels",
      icon: <Box className="w-6 h-6 text-amber-500" />,
      iconBg: "bg-amber-500/10 border-amber-500/20",
      path: "/admin/products",
      tag: "Catalog",
    },
    {
      label: "Manage Orders",
      description: "Review customer purchases, dispatch statuses, and payment tracking",
      icon: <PackageSearch className="w-6 h-6 text-blue-500" />,
      iconBg: "bg-blue-500/10 border-blue-500/20",
      path: "/admin/orders",
      tag: "Fulfillment",
    },
    {
      label: "Manage Users",
      description: "Inspect customer accounts, assign roles, and moderate access",
      icon: <UserRound className="w-6 h-6 text-purple-500" />,
      iconBg: "bg-purple-500/10 border-purple-500/20",
      path: "/admin/users",
      tag: "Accounts",
    },
    {
      label: "Promo Coupons",
      description: "Create flat or percentage discount codes with validity rules",
      icon: <TicketPercent className="w-6 h-6 text-rose-500" />,
      iconBg: "bg-rose-500/10 border-rose-500/20",
      path: "/admin/coupons",
      tag: "Marketing",
    },
    {
      label: "Delivery Logistics Hub",
      description: "Real-time dispatch tracking, route updates, and delivery confirmations",
      icon: <Truck className="w-6 h-6 text-emerald-500" />,
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      path: "/delivery/dashboard",
      tag: "Logistics",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10 min-h-[80vh]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Enterprise Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Admin Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor real-time sales metrics, catalog inventory, orders, and logistics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={fetchAllData}
            variant="outline"
            size="sm"
            disabled={loading}
            className="rounded-xl text-xs flex items-center gap-1.5 font-semibold shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border bg-card space-y-3 shadow-xs">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-7 sm:h-8 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          : metrics.map((stat) => (
              <div
                key={stat.label}
                className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border bg-card shadow-xs hover:shadow-md transition space-y-2.5 sm:space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider line-clamp-1">
                    {stat.label}
                  </span>
                  <div className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border shrink-0 ${stat.bg}`}>
                    {stat.icon}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-3xl font-black text-foreground tracking-tight">
                    {stat.value}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground border-t pt-2 sm:pt-2.5">
                  <TrendingUp className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary shrink-0" />
                  <span className="truncate">{stat.badge}</span>
                </div>
              </div>
            ))}
      </div>

      {/* Management Modules */}
      <div className="space-y-4 pt-1 sm:pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Store Operations & Services
            </h2>
            <p className="text-xs text-muted-foreground">
              Select a module to manage store catalog, fulfillment, user data, or marketing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {managementModules.map((item) => (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              className="group p-4 sm:p-5 rounded-2xl sm:rounded-3xl border bg-card shadow-xs hover:shadow-md hover:border-primary/40 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 sm:space-y-4 hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border ${item.iconBg}`}>
                  {item.icon}
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border">
                  {item.tag}
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
