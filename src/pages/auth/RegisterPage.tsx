import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { setUser } from "@/redux/slices/authSlice"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        dispatch(setUser(data.user))
        toast.success("Registered successfully")
        navigate("/")
      } else {
        toast.error(data.message || "Registration failed")
      }
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="px-4 sm:px-6 py-12 sm:py-20 bg-background min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-muted p-6 sm:p-8 rounded-xl shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Register</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-2.5 right-3 text-muted-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full p-2 border rounded text-sm bg-white dark:bg-background text-foreground pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute top-2.5 right-3 text-muted-foreground"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-primary py-2 rounded text-sm transition font-medium text-background dark:text-black"
          >
            Register
          </button>
        </form>

        <div className="text-xs text-muted-foreground mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
