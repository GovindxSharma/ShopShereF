import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom"
import type { RootState } from "@/redux/store"

export default function AdminRoute() {
  const { user, loading } = useSelector((state: RootState) => state.auth)

  if (loading) return null // or a spinner

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== "admin") return <Navigate to="/" replace />

  return <Outlet />
}
