import { Navigate, Outlet } from "react-router-dom"
import { useAppSelector } from "@/redux/hooks"

export default function DeliveryRoute() {
  const { user, loading } = useAppSelector((state) => state.auth)

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== "delivery" && user.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
