// src/pages/ProfilePage.tsx
import { useState } from "react"
import { useAppSelector } from "@/redux/hooks"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!oldPassword || !newPassword) {
      toast.error("Please fill in all fields")
      return
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
      } else {
        toast.error(data.message || "Password update failed")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="bg-white dark:bg-muted p-6 rounded-xl shadow space-y-4">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-4">Update Password</h2>

      <form onSubmit={handlePasswordUpdate} className="space-y-4">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Current Password"
          className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground pr-10"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary py-2 rounded text-sm transition font-medium text-background dark:text-black disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  )
}
