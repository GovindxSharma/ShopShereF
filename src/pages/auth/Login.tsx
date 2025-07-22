import { useState } from "react"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { setUser } from "@/redux/slices/authSlice"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        dispatch(setUser(data.user))
        toast.success("Logged in successfully")
        navigate("/")
      } else {
        toast.error(data.message || "Login failed")
      }
    } catch {
      toast.error("Something went wrong")
    }
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
    <div className="px-4 sm:px-6 py-12 sm:py-20 bg-background min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-muted p-6 sm:p-8 rounded-xl shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-primary py-2 rounded text-sm transition font-medium text-background dark:text-black"
          >
            Login
          </button>
        </form>

        {/* 🔗 Responsive Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2 sm:gap-0 text-xs text-muted-foreground mt-4 text-center sm:text-left">
          <Link to="/register" className="hover:underline">
            Don’t have an account? Register
          </Link>
          <Link to="/forgot-password" className="hover:underline">
            Forgot Password?
          </Link>
        </div>

        <div className="text-center mt-4 text-muted-foreground text-sm">or</div>

        <div className="flex justify-center mt-4">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Google login failed")}
            theme="outline"
            size="medium"
            width="250"
          />
        </div>
      </div>
    </div>
  )
}
