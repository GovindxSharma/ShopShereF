import { useState } from "react"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { setUser } from "@/redux/slices/authSlice"
import {
  ShieldAlert,
  Truck,
  UserRound,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const submitLogin = async (loginEmail: string, loginPass: string, roleRedirect?: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      })

      const data = await res.json()

      if (res.ok && data.user) {
        dispatch(setUser(data.user))
        toast.success(`Welcome back, ${data.user.name || "User"}!`)
        if (roleRedirect) {
          navigate(roleRedirect)
        } else if (data.user.role === "admin") {
          navigate("/admin/dashboard")
        } else if (data.user.role === "delivery") {
          navigate("/delivery/dashboard")
        } else {
          navigate("/")
        }
      } else {
        toast.error(data.message || "Login failed. Check credentials.")
      }
    } catch {
      toast.error("Network error during login")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await submitLogin(email, password)
    setLoading(false)
  }

  // ⚡ 1-Click Demo Login Handler
  const handleDemoLogin = async (role: "admin" | "delivery" | "user") => {
    setDemoLoading(role)
    if (role === "admin") {
      setEmail("admin@shopshere.com")
      setPassword("Admin@12345")
      await submitLogin("admin@shopshere.com", "Admin@12345", "/admin/dashboard")
    } else if (role === "delivery") {
      setEmail("delivery@shopshere.com")
      setPassword("Delivery@12345")
      await submitLogin("delivery@shopshere.com", "Delivery@12345", "/delivery/dashboard")
    } else {
      setEmail("user@shopshere.com")
      setPassword("User@12345")
      await submitLogin("user@shopshere.com", "User@12345", "/")
    }
    setDemoLoading(null)
  }

  const handleGoogleLogin = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error("Google credential not received")
      return
    }

    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: response.credential }),
      })

      const data = await res.json()

      if (res.ok) {
        dispatch(setUser(data.user))
        toast.success("Google login successful")
        navigate("/")
      } else {
        toast.error(data.message || "Google login failed")
      }
    } catch {
      toast.error("Google login error")
    }
  }

  return (
    <div className="px-4 sm:px-6 py-10 sm:py-16 bg-background min-h-[calc(100vh-64px)] flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-card border border-border/80 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Sign In to ShopSphere
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Enter your email and password or use 1-click demo access below
          </p>
        </div>

        {/* ⚡ 1-Click Demo Accounts Banner */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-primary/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Access
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">Tap to Sign In</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Admin */}
            <button
              type="button"
              disabled={Boolean(demoLoading)}
              onClick={() => handleDemoLogin("admin")}
              className="p-2.5 rounded-xl border border-border/60 bg-background hover:bg-primary/5 hover:border-primary/50 transition flex flex-col items-center gap-1.5 text-center group shadow-2xs"
            >
              {demoLoading === "admin" ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition" />
              )}
              <span className="text-[11px] font-extrabold text-foreground leading-tight">Admin</span>
              <span className="text-[9px] text-muted-foreground">Owner</span>
            </button>

            {/* Delivery */}
            <button
              type="button"
              disabled={Boolean(demoLoading)}
              onClick={() => handleDemoLogin("delivery")}
              className="p-2.5 rounded-xl border border-border/60 bg-background hover:bg-primary/5 hover:border-primary/50 transition flex flex-col items-center gap-1.5 text-center group shadow-2xs"
            >
              {demoLoading === "delivery" ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition" />
              )}
              <span className="text-[11px] font-extrabold text-foreground leading-tight">Delivery</span>
              <span className="text-[9px] text-muted-foreground">Courier</span>
            </button>

            {/* User */}
            <button
              type="button"
              disabled={Boolean(demoLoading)}
              onClick={() => handleDemoLogin("user")}
              className="p-2.5 rounded-xl border border-border/60 bg-background hover:bg-primary/5 hover:border-primary/50 transition flex flex-col items-center gap-1.5 text-center group shadow-2xs"
            >
              {demoLoading === "user" ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <UserRound className="w-4 h-4 text-green-600 group-hover:scale-110 transition" />
              )}
              <span className="text-[11px] font-extrabold text-foreground leading-tight">Customer</span>
              <span className="text-[9px] text-muted-foreground">Shopper</span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" /> Email Address
            </label>
            <input
              type="email"
              placeholder="user@shopshere.com"
              className="w-full p-2.5 border rounded-xl bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" /> Password
              </label>
              <Link to="/forgot-password" className="text-[11px] text-primary hover:underline font-semibold">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-2.5 border rounded-xl bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl font-bold shadow-md h-10 text-xs sm:text-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t" />
          <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">or</span>
          <div className="flex-1 border-t" />
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Google login failed")}
            theme="outline"
            size="large"
            shape="pill"
            width="320"
          />
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-muted-foreground border-t pt-4">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-primary font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}
