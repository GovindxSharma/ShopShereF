import { useEffect, useState } from "react"
import { useAppDispatch } from "@/redux/hooks"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import {
  Box,
  PackageSearch,
  UserRound,
  IndianRupee,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE}/orders/admin/analytics`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch analytics")
        const data = await res.json()
        setStats(data)
      } catch (error) {
        toast.error("Failed to load dashboard analytics.")
      }
    }

    const fetchProductCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch product count")
        const data = await res.json()
        setProductCount(data.total)
      } catch (error) {
        toast.error("Failed to load product count.")
      }
    }

    const fetchUserCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/users`, {
          credentials: "include",
        })
        if (!res.ok) throw new Error("Failed to fetch user count")
        const data = await res.json()
        setTotalUsers(data.total)
      } catch (error) {
        toast.error("Failed to load user count.")
      }
    }

    Promise.all([
      fetchAnalytics(),
      fetchProductCount(),
      fetchUserCount(),
    ]).finally(() => setLoading(false))
  }, [dispatch])

  const metrics = [
    {
      label: "Total Revenue",
      value: stats?.totalRevenue,
      icon: <IndianRupee className="w-5 h-5 text-green-600" />,
      bg: "bg-green-100",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders,
      icon: <PackageSearch className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      label: "Total Products",
      value: productCount,
      icon: <Box className="w-5 h-5 text-yellow-600" />,
      bg: "bg-yellow-100",
    },
    {
      label: "Total Users",
      value: totalUsers,
      icon: <UserRound className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-100",
    },
  ]

  const managementLinks = [
    {
      label: "Manage Products",
      icon: <Box className="w-6 h-6 text-primary" />,
      path: "/admin/products",
    },
    {
      label: "Manage Orders",
      icon: <PackageSearch className="w-6 h-6 text-primary" />,
      path: "/admin/orders",
    },
    {
      label: "Manage Users",
      icon: <UserRound className="w-6 h-6 text-primary" />,
      path: "/admin/users",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">📊 Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Track performance and manage the store
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-6 w-2/3" />
              </Card>
            ))
          : metrics.map((stat) => (
              <Card
                key={stat.label}
                className="shadow-sm hover:shadow-md transition-all border"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-md ${stat.bg}`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {stat.label === "Total Revenue"
                      ? `₹${stat.value?.toLocaleString()}`
                      : stat.value ?? "-"}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">🛠️ Quick Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {managementLinks.map((item) => (
            <Card
              key={item.label}
              onClick={() => navigate(item.path)}
              className="cursor-pointer transition hover:scale-[1.02] hover:shadow-md"
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-primary/10 p-3 rounded-xl">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium text-lg">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    View and manage
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
