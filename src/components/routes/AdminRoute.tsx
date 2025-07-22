import { useSelector } from "react-redux"
import { Navigate, Outlet } from "react-router-dom"
import type { RootState } from "@/redux/store"

export default function AdminRoute() {
  const user = useSelector((state: RootState) => state.auth.user)

  if (!user) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />
  }

  if (user.role !== "admin") {
    // Logged in but not admin → redirect to homepage or show 403
    return <Navigate to="/" replace />
  }

  // Authenticated and is admin → allow access
  return <Outlet />
}
