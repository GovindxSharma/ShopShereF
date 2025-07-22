import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      return toast.error("Please fill in all fields")
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match")
    }

    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Password reset successful")
        navigate("/login")
      } else {
        toast.error(data.message || "Reset failed")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 py-12 sm:py-20 bg-background min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-muted p-6 sm:p-8 rounded-xl shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Reset Password</h1>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary py-2 rounded text-sm transition font-medium text-background dark:text-black disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
