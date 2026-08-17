import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  ChevronDown,
  Heart,
  User as UserIcon,
  Package,
  ShieldAlert,
  LogOut,
  Sparkles,
  Truck,
  Home as HomeIcon,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import clsx from "clsx"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { logoutUser } from "@/redux/slices/authSlice"
import { toast } from "sonner"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { selectCartCount } from "@/redux/slices/cartSlice"
import { selectWishlistItems } from "@/redux/slices/wishlistSlice"
import { motion, AnimatePresence } from "framer-motion"
import Fuse from "fuse.js"
import type { Product } from "@/types/product"

const navLinks = [
  { name: "Home", path: "/" },
  { name: "All Products", path: "/products" },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchModalRef = useRef<HTMLDivElement>(null)

  const user = useAppSelector((state) => state.auth.user)
  const cartCount = useAppSelector(selectCartCount)
  const wishlistItems = useAppSelector(selectWishlistItems)

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      toast.success("Logged out successfully")
      navigate("/")
    } catch {
      toast.success("Logged out")
      navigate("/")
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        searchOpen &&
        searchModalRef.current &&
        !searchModalRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [searchOpen])

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/40 shadow-2xs transition-all h-14 sm:h-16">
        <div className="max-w-7xl mx-auto h-full px-3.5 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Brand Logo */}
          <Link
            to={user?.role === "delivery" ? "/delivery/dashboard" : "/"}
            className="flex items-center gap-2.5 text-base sm:text-xl font-bold tracking-tight text-foreground hover:opacity-90 transition shrink-0"
          >
            <img
              src="/logo.png"
              alt="ShopSphere Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-xl"
            />
            <span className="font-black tracking-tight">
              {user?.role === "delivery" ? "Logistics Hub" : "ShopSphere"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user?.role === "delivery" ? (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/delivery/dashboard"
                className="text-sm font-bold text-primary flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10"
              >
                <Truck className="w-4 h-4" /> Active Delivery Run
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={clsx(
                    "text-sm font-medium transition-colors hover:text-primary relative py-1",
                    pathname === link.path
                      ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                      : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Actions & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Quick Search Button (Always accessible) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="rounded-full hover:bg-muted w-8 h-8 sm:w-9 sm:h-9"
              title="Search products (Cmd+K)"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </Button>

            {user?.role !== "delivery" && (
              <>
                {/* Desktop-only Wishlist Button (mobile uses bottom bar) */}
                <Link to="/wishlist" className="relative hidden md:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-muted w-9 h-9"
                    title="Wishlist"
                  >
                    <Heart className="w-5 h-5 text-foreground" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-4 h-4 flex items-center justify-center px-1 shadow-sm">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* Desktop-only Cart Button (mobile uses bottom bar) */}
                <Link to="/cart" className="relative hidden md:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-muted w-9 h-9"
                    title="Shopping Cart"
                  >
                    <ShoppingCart className="w-5 h-5 text-foreground" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full min-w-4 h-4 flex items-center justify-center px-1 shadow-sm animate-pulse">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <ModeToggle />

            {/* User Dropdown / Login */}
            {user ? (
              <div ref={dropdownRef} className="relative hidden sm:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition text-sm font-medium shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold uppercase">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-56 bg-card border rounded-2xl shadow-xl py-2 z-50 divide-y divide-border/50"
                    >
                      <div className="px-4 py-2">
                        <p className="text-xs text-muted-foreground">Signed in as</p>
                        <p className="text-sm font-semibold truncate text-foreground">
                          {user.email}
                        </p>
                        {user.role === "admin" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-1">
                            <Sparkles className="w-3 h-3" /> Admin Account
                          </span>
                        )}
                        {user.role === "delivery" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary mt-1">
                            <Truck className="w-3 h-3" /> Delivery Partner
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                        >
                          <UserIcon className="w-4 h-4 text-muted-foreground" />
                          Profile Settings
                        </Link>

                        {user.role !== "delivery" && (
                          <>
                            <Link
                              to="/orders"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                            >
                              <Package className="w-4 h-4 text-muted-foreground" />
                              My Orders
                            </Link>
                            <Link
                              to="/wishlist"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                            >
                              <Heart className="w-4 h-4 text-muted-foreground" />
                              Wishlist
                            </Link>
                          </>
                        )}
                      </div>

                      {(user.role === "delivery" || user.role === "admin") && (
                        <div className="py-1 bg-primary/5">
                          <Link
                            to="/delivery/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
                          >
                            <Truck className="w-4 h-4" />
                            Delivery Hub
                          </Link>
                        </div>
                      )}

                      {user.role === "admin" && (
                        <div className="py-1 bg-primary/5">
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        </div>
                      )}

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false)
                            handleLogout()
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="default" size="sm" className="rounded-full shadow-xs">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger Button */}
            <button
              className="md:hidden p-1.5 rounded-full hover:bg-muted text-foreground transition flex items-center justify-center w-8 h-8"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              {user ? (
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black uppercase">
                  {user.name?.charAt(0) || "U"}
                </div>
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background border-l z-50 shadow-2xl p-6 flex flex-col justify-between"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="font-extrabold text-lg flex items-center gap-2 text-foreground">
                    <img
                      src="/logo.png"
                      alt="ShopSphere Logo"
                      className="w-6 h-6 object-contain rounded-md"
                    />{" "}
                    ShopSphere
                  </span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-2">
                  {user?.role === "delivery" ? (
                    <>
                      <Link
                        to="/delivery/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-bold flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4" /> Active Delivery Run
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2 rounded-lg hover:bg-muted font-medium text-sm"
                      >
                        Profile Settings
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2 rounded-lg hover:bg-muted font-medium"
                      >
                        Home
                      </Link>
                      <Link
                        to="/products"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2 rounded-lg hover:bg-muted font-medium"
                      >
                        Browse Products
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2 rounded-lg hover:bg-muted font-medium flex justify-between items-center"
                      >
                        <span>Wishlist</span>
                        {wishlistItems.length > 0 && (
                          <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                            {wishlistItems.length}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2 rounded-lg hover:bg-muted font-medium flex justify-between items-center"
                      >
                        <span>Cart</span>
                        {cartCount > 0 && (
                          <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                            {cartCount}
                          </span>
                        )}
                      </Link>

                      {user && (
                        <div className="pt-4 border-t my-2 space-y-1">
                          <p className="px-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            Account
                          </p>
                          <Link
                            to="/profile"
                            onClick={() => setMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-muted block text-sm"
                          >
                            Profile
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setMenuOpen(false)}
                            className="px-3 py-2 rounded-lg hover:bg-muted block text-sm"
                          >
                            Orders
                          </Link>
                          {user.role === "admin" && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setMenuOpen(false)}
                              className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium block text-sm flex items-center gap-2"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              Admin Dashboard
                            </Link>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {!user && (
                    <div className="pt-4 border-t">
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        <Button className="w-full rounded-xl">Sign In</Button>
                      </Link>
                    </div>
                  )}
                </nav>
              </div>

              <div className="pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                <span>Theme</span>
                <ModeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center pt-20 px-4">
          <div
            ref={searchModalRef}
            className="w-full max-w-2xl bg-card shadow-2xl border rounded-2xl p-6 relative max-h-[500px] flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    navigate(`/products?search=${encodeURIComponent(query.trim())}`)
                    setSearchOpen(false)
                    setQuery("")
                  }
                }}
                placeholder="Search smartphones, laptops, audio, shoes, brands..."
                className="w-full pl-11 pr-10 py-3 rounded-xl border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium placeholder:text-muted-foreground"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <LiveProductResults
              query={query}
              onSelect={() => {
                setSearchOpen(false)
                setQuery("")
              }}
            />
          </div>
        </div>
      )}

      {/* 📱 Mobile Bottom Navigation Bar (sm:hidden) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/60 py-2 px-3 flex justify-around items-center shadow-lg">
        {user?.role === "delivery" ? (
          <>
            <Link
              to="/delivery/dashboard"
              className={clsx(
                "flex flex-col items-center gap-1 text-[10px] font-bold transition",
                pathname.startsWith("/delivery") ? "text-primary font-black" : "text-muted-foreground"
              )}
            >
              <Truck className="w-5 h-5" />
              <span>Shipments</span>
            </Link>
            <Link
              to="/profile"
              className={clsx(
                "flex flex-col items-center gap-1 text-[10px] font-bold transition",
                pathname === "/profile" ? "text-primary font-black" : "text-muted-foreground"
              )}
            >
              <UserIcon className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/"
              className={clsx(
                "flex flex-col items-center gap-1 text-[10px] font-bold transition relative",
                pathname === "/" ? "text-primary font-black" : "text-muted-foreground"
              )}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              to="/products"
              className={clsx(
                "flex flex-col items-center gap-1 text-[10px] font-bold transition relative",
                pathname === "/products" ? "text-primary font-black" : "text-muted-foreground"
              )}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Catalog</span>
            </Link>

            <Link
              to="/wishlist"
              className={clsx(
                "flex flex-col items-center gap-1 text-[10px] font-bold transition relative",
                pathname === "/wishlist" ? "text-primary font-black" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-2 text-[9px] font-black bg-red-500 text-white rounded-full min-w-3.5 h-3.5 flex items-center justify-center px-0.5">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
              <span>Wishlist</span>
            </Link>

            <Link
              to="/cart"
              className={clsx(
                "flex flex-col items-center gap-1 text-[10px] font-bold transition relative",
                pathname === "/cart" ? "text-primary font-black" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 text-[9px] font-black bg-primary text-primary-foreground rounded-full min-w-3.5 h-3.5 flex items-center justify-center px-0.5 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>

            <Link
              to={user ? (user.role === "admin" ? "/admin/dashboard" : "/profile") : "/login"}
              className={clsx(
                "flex flex-col items-center gap-1 text-[10px] font-bold transition relative",
                pathname === "/profile" || pathname.startsWith("/admin") || pathname === "/login"
                  ? "text-primary font-black"
                  : "text-muted-foreground"
              )}
            >
              <UserIcon className="w-5 h-5" />
              <span>{user ? (user.role === "admin" ? "Admin" : "Account") : "Login"}</span>
            </Link>
          </>
        )}
      </nav>
    </>
  )
}

function LiveProductResults({
  query,
  onSelect,
}: {
  query: string
  onSelect: () => void
}) {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        const API_BASE = import.meta.env.VITE_API_BASE_URL
        const res = await fetch(`${API_BASE}/products/all`)
        const data = await res.json()
        setAllProducts(data.products || [])
      } catch (err) {
        console.error("Failed to fetch products for live search", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAllProducts()
  }, [])

  useEffect(() => {
    if (!query.trim() || allProducts.length === 0) {
      setResults([])
      return
    }

    const fuse = new Fuse(allProducts, {
      keys: ["name", "category", "description"],
      threshold: 0.35,
    })

    const matches = fuse.search(query).map((match) => match.item)
    setResults(matches)
  }, [query, allProducts])

  if (!query.trim()) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Type to search across all products, brands, and categories.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-border/40">
      {loading && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Loading catalog...
        </p>
      )}
      {!loading && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm font-medium">No matching products found.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Press Enter to view all results on the products page.
          </p>
        </div>
      )}
      {results.slice(0, 6).map((product) => (
        <div
          key={product._id}
          className="flex justify-between items-center p-3 rounded-xl hover:bg-muted/60 transition cursor-pointer group"
          onClick={() => {
            navigate(`/products/${product._id}`)
            onSelect()
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop"}
              alt={product.name}
              className="w-12 h-12 object-contain rounded-lg bg-muted/40 p-1 group-hover:scale-105 transition"
            />
            <div>
              <p className="font-semibold text-sm group-hover:text-primary transition line-clamp-1">
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {product.category} · ★ {product.ratings || 5}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">
              ₹{product.price.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
