import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Trash2, Home } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  _id: string
  name: string
  email: string
  role: "user" | "delivery" | "admin"
}

const AdminUsers = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data.users)
    } catch {
      toast.error("Failed to load users.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      setDeleting(userId)
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to delete user")
      setUsers((prev) => prev.filter((user) => user._id !== userId))
      toast.success("User deleted successfully")
    } catch {
      toast.error("Error deleting user")
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* 🔝 Header with Back Button */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">👥 Manage Users</h1>
          <p className="text-muted-foreground text-sm">
            View and manage all registered users
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/dashboard")}
          className="flex gap-2 items-center"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground">No users found.</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {user.name}{" "}
                  {user.role === "admin" && (
                    <span className="text-xs text-green-600 ml-2">(admin)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
                {user.role !== "admin" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(user._id)}
                    disabled={deleting === user._id}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {deleting === user._id ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminUsers
