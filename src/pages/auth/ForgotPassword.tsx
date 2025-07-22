import { useState } from "react"
import { toast } from "sonner"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email")
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "Reset link sent to your email")
      } else {
        toast.error(data.message || "Failed to send reset link")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 py-12 sm:py-20 bg-background min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-muted p-6 sm:p-8 rounded-xl shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Forgot Password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary py-2 rounded text-sm transition font-medium text-background dark:text-black disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          You’ll receive an email with instructions to reset your password.
        </p>
      </div>
    </div>
  )
}
