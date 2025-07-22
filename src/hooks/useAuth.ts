// src/hooks/useAuth.ts
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"

export const useAuth = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  return { user, isAuthenticated: !!user }
}
