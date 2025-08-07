import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null // or a spinner

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
