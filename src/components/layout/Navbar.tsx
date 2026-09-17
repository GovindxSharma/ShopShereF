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
import CommandSearchModal from "@/components/common/CommandSearchModal"

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
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // ⌨️ Global Command+K (macOS) / Ctrl+K (Windows/Linux) & Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
      if (e.key === "Escape" && searchOpen) {
        e.preventDefault()
        setSearchOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
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
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Desktop Command-K Search Launcher Pill */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search catalog (Cmd+K)"
              className="hidden sm:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-border/70 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground text-xs font-medium transition shadow-2xs group cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="hidden md:inline">Search drops, kicks, gear...</span>
              <span className="inline md:hidden">Search...</span>
              <kbd className="ml-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border/80 font-bold text-muted-foreground shadow-2xs group-hover:border-primary/40 transition-colors">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Quick Search Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search catalog"
              onClick={() => setSearchOpen(true)}
              className="sm:hidden rounded-full hover:bg-muted w-9 h-9 text-foreground active:scale-90 transition-transform"
              title="Search products (Cmd+K)"
            >
              <Search className="w-4.5 h-4.5" />
            </Button>

            {user?.role !== "delivery" && (
              <>
                {/* Desktop-only Wishlist Button (mobile uses bottom bar) */}
                <Link to="/wishlist" className="relative hidden md:block" aria-label="Wishlist">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Wishlist"
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
                <Link to="/cart" className="relative hidden md:block" aria-label="Shopping Cart">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Shopping Cart"
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
                  aria-label="User Account Menu"
                  aria-expanded={dropdownOpen}
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
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background border-l z-50 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="font-extrabold text-lg flex items-center gap-2 text-foreground">
                    <img
                      src="/logo.png"
                      alt="ShopSphere Logo"
                      className="w-6 h-6 object-contain rounded-md"
                    />{" "}
                    {user?.role === "delivery" ? "Logistics Hub" : "ShopSphere"}
                  </span>
                  <button
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info Header Card if logged in */}
                {user && (
                  <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-black uppercase shrink-0">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      {user.role === "admin" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-0.5">
                          <Sparkles className="w-3 h-3" /> Admin Account
                        </span>
                      )}
                      {user.role === "delivery" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary mt-0.5">
                          <Truck className="w-3 h-3" /> Delivery Partner
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-1.5">
                  {user?.role === "delivery" ? (
                    <>
                      <Link
                        to="/delivery/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2.5 rounded-xl bg-primary/10 text-primary font-bold flex items-center gap-2.5 text-sm"
                      >
                        <Truck className="w-4 h-4" /> Active Delivery Run
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2.5 rounded-xl hover:bg-muted font-medium text-sm flex items-center gap-2.5"
                      >
                        <UserIcon className="w-4 h-4 text-muted-foreground" /> Profile Settings
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          setSearchOpen(true)
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted font-medium text-sm flex items-center justify-between text-foreground cursor-pointer transition border border-border/50 active:scale-98"
                      >
                        <span className="flex items-center gap-2.5">
                          <Search className="w-4 h-4 text-primary" /> Search Products
                        </span>
                        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border/70 text-muted-foreground font-bold">
                          ⌘K
                        </kbd>
                      </button>

                      <Link
                        to="/"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2.5 rounded-xl hover:bg-muted font-medium text-sm flex items-center gap-2.5"
                      >
                        <HomeIcon className="w-4 h-4 text-muted-foreground" /> Home
                      </Link>
                      <Link
                        to="/products"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2.5 rounded-xl hover:bg-muted font-medium text-sm flex items-center gap-2.5"
                      >
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" /> Browse Products
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2.5 rounded-xl hover:bg-muted font-medium text-sm flex justify-between items-center"
                      >
                        <span className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4 text-muted-foreground" /> Wishlist
                        </span>
                        {wishlistItems.length > 0 && (
                          <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">
                            {wishlistItems.length}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setMenuOpen(false)}
                        className="px-3 py-2.5 rounded-xl hover:bg-muted font-medium text-sm flex justify-between items-center"
                      >
                        <span className="flex items-center gap-2.5">
                          <ShoppingCart className="w-4 h-4 text-muted-foreground" /> Cart
                        </span>
                        {cartCount > 0 && (
                          <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold">
                            {cartCount}
                          </span>
                        )}
                      </Link>

                      {user && (
                        <div className="pt-3 border-t my-1 space-y-1">
                          <p className="px-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            Account
                          </p>
                          <Link
                            to="/profile"
                            onClick={() => setMenuOpen(false)}
                            className="px-3 py-2.5 rounded-xl hover:bg-muted font-medium text-sm flex items-center gap-2.5"
                          >
                            <UserIcon className="w-4 h-4 text-muted-foreground" /> Profile Settings
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setMenuOpen(false)}
                            className="px-3 py-2.5 rounded-xl hover:bg-muted font-medium text-sm flex items-center gap-2.5"
                          >
                            <Package className="w-4 h-4 text-muted-foreground" /> My Orders
                          </Link>
                          {user.role === "admin" && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setMenuOpen(false)}
                              className="px-3 py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm flex items-center gap-2.5"
                            >
                              <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                            </Link>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Log Out Button for Mobile Users */}
                  {user && (
                    <div className="pt-3 border-t mt-2">
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 active:bg-red-500/20 transition border border-red-500/20 text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
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

              <div className="pt-4 border-t flex justify-between items-center text-sm text-muted-foreground mt-6">
                <span>Theme</span>
                <ModeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Command-K Quick Search Modal */}
      <CommandSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* 📱 Mobile Bottom Navigation Bar (sm:hidden) */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/60 pt-2 px-2 flex justify-around items-center shadow-lg"
        style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom, 10px))" }}
      >
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
                "flex flex-col items-center justify-center h-full min-w-[52px] px-2 gap-1 text-[10px] font-bold transition relative touch-manipulation",
                pathname === "/" ? "text-primary font-black" : "text-muted-foreground"
              )}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              to="/products"
              className={clsx(
                "flex flex-col items-center justify-center h-full min-w-[52px] px-2 gap-1 text-[10px] font-bold transition relative touch-manipulation",
                pathname === "/products" ? "text-primary font-black" : "text-muted-foreground"
              )}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Catalog</span>
            </Link>

            <Link
              to="/wishlist"
              className={clsx(
                "flex flex-col items-center justify-center h-full min-w-[52px] px-2 gap-1 text-[10px] font-bold transition relative touch-manipulation",
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
                "flex flex-col items-center justify-center h-full min-w-[52px] px-2 gap-1 text-[10px] font-bold transition relative touch-manipulation",
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
                "flex flex-col items-center justify-center h-full min-w-[52px] px-2 gap-1 text-[10px] font-bold transition relative touch-manipulation",
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

