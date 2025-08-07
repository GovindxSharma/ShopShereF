// src/hooks/useAuth.ts
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

export const useAuth = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth)
  return { user, isAuthenticated: !!user, loading }
}

