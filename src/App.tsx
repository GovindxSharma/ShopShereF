// src/App.tsx
import { Routes, Route, Link } from "react-router-dom"
import { useEffect } from "react"
import { useAppDispatch } from "@/redux/hooks"
import { useSelector } from "react-redux"
import { setUser, clearUser } from "@/redux/slices/authSlice"
import { fetchCart } from "@/redux/slices/cartSlice"
import type { RootState } from "@/redux/store"

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
import WishlistPage from "@/pages/user/WishlistPage"
import CheckoutPage from "@/pages/CheckOut"

import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminOrders from "@/pages/admin/AdminOrders"
import AdminProducts from "@/pages/admin/AdminProducts"
import AdminUsers from "@/pages/admin/AdminUsers"
import AdminCoupons from "@/pages/admin/AdminCoupons"
import AdminOrderDetailsPage from "./pages/admin/AdminOrderDetailsPage"
import DeliveryDashboard from "@/pages/delivery/DeliveryDashboard"
import NotFoundPage from "@/pages/NotFoundPage"

import ProtectedRoute from "@/components/routes/ProtectedRoute"
import UnauthenticatedRoute from "@/components/routes/UnauthenticatedRoute"
import AdminRoute from "@/components/routes/AdminRoute"
import DeliveryRoute from "@/components/routes/DeliveryRoute"

import ChatBot from "./components/chatbot/Chatbot"
import "./App.css"
import Loader from "@/components/common/Loader"
import ScrollToTop from "@/components/common/ScrollToTop"

function App() {
  const dispatch = useAppDispatch()
  const { loading } = useSelector((state: RootState) => state.auth)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  // ✅ Fetch user on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        })
        const data = await res.json()
        if (res.ok && data.user) {
          dispatch(setUser(data.user))
        } else {
          dispatch(clearUser())
        }
      } catch (err) {
        dispatch(clearUser())
      }
    }

    fetchUser()
  }, [API_BASE, dispatch])

  // ✅ Fetch cart on app load
  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  // ⏳ Wait until auth is resolved
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl bg-background">
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* 🌍 Public */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<WishlistPage />} />

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
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetailsPage />} />
          </Route>

          {/* 🚚 Logistics & Delivery Executive Portal */}
          <Route element={<DeliveryRoute />}>
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          </Route>

          {/* 🔍 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <ChatBot />
      </main>

      {/* 🌟 Modern Footer */}
      <footer className="bg-card border-t border-border/40 py-12 text-sm text-muted-foreground mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link to="/" className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="ShopSphere Logo"
                className="w-7 h-7 object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <span className="font-extrabold tracking-tight">ShopSphere</span>
            </Link>
            <p className="text-xs leading-relaxed">
              Curated fashion, apparel, and lifestyle essentials with fast nationwide delivery and secure checkout.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link to="/products" className="hover:text-primary transition">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-primary transition">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-primary transition">
                  Order Tracking
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Customer Care
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <span className="text-muted-foreground">Free Shipping on Orders &gt; ₹999</span>
              </li>
              <li>
                <span className="text-muted-foreground">7-Day Return Policy</span>
              </li>
              <li>
                <span className="text-muted-foreground">Promo Code: SHOPSHERE10 (10% OFF)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Contact & Support
            </h4>
            <p className="text-xs">
              Email: <span className="text-foreground">govindsharma2839@gmail.com</span>
            </p>
            <p className="text-xs">
              Phone / WA: <span className="text-foreground">+91 9712935176</span>
            </p>
            <p className="text-xs text-muted-foreground pt-2">
              © {new Date().getFullYear()} ShopSphere. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
