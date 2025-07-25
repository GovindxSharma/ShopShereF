// src/App.tsx
import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { useAppDispatch } from "@/redux/hooks"
import { setUser, clearUser } from "@/redux/slices/authSlice"
import { fetchCart } from "@/redux/slices/cartSlice" // ✅ import cart fetch

import Navbar from "@/components/layout/Navbar"
import Home from "@/pages/Home"
import ProductsPage from "@/pages/products/Products"
import ProductDetail from "@/pages/products/ProductDetail"

import CartPage from "@/pages/CartPage"
import Login from "@/pages/auth/Login"
import Register from "@/pages/auth/RegisterPage"
import ForgotPassword from "@/pages/auth/ForgotPassword"
import ResetPassword from "@/pages/auth/ResetPassword"
import UpdatePassword from "@/pages/auth/UpdatePassword"
import UserOrders from "@/pages/user/UserOrders"
import ProfilePage from "@/pages/user/ProfilePage"
import CheckoutPage from "@/pages/CheckOut"

import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminOrders from "@/pages/admin/AdminOrders"
import AdminProducts from "@/pages/admin/AdminProducts"
import AdminUsers from "@/pages/admin/AdminUsers"


import ProtectedRoute from "@/components/routes/ProtectedRoute"
import UnauthenticatedRoute from "@/components/routes/UnauthenticatedRoute"
import AdminRoute from "@/components/routes/AdminRoute"

import "./App.css"
import AdminOrderDetailsPage from "./pages/admin/AdminOrderDetailsPage"
import ChatBot from "./components/chatbot/Chatbo"


function App() {
  const dispatch = useAppDispatch()

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  // ✅ Fetch user on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        })
        const data = await res.json()
        if (res.ok) dispatch(setUser(data.user))
        else dispatch(clearUser())
      } catch {
        dispatch(clearUser())
      }
    }

    fetchUser()
  }, [API_BASE, dispatch])

  // ✅ Fetch cart on app load
  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* 🌍 Public */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* 🔒 Authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/orders" element={<UserOrders />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

          </Route>

          {/* 🚫 Not logged in */}
          <Route element={<UnauthenticatedRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* 🛡️ Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetailsPage />} />

          </Route>
        </Routes>

        <ChatBot />
      </main>
    </div>
  )
}

export default App
