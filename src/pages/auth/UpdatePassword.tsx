import { useState } from "react"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function UpdatePassword() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill in all fields")
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match")
    }

    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/auth/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Password updated successfully")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(data.message || "Update failed")
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
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Update Password</h1>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Old Password"
            className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-primary py-2 rounded text-sm transition font-medium text-background dark:text-black disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}
