// src/components/routes/UnauthenticatedRoute.tsx
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export default function UnauthenticatedRoute() {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}
