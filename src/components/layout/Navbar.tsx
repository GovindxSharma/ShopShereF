import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/authSlice";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { selectCartCount } from "@/redux/slices/cartSlice";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<HTMLDivElement>(null);

  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector(selectCartCount);

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Logout failed");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        searchOpen &&
        searchModalRef.current &&
        !searchModalRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [searchOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
          🛍️ShopSphere
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={clsx(
                  "text-sm font-medium hover:text-primary transition-colors",
                  pathname === link.path && "text-primary"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Buttons */}
          <div className="flex items-center gap-2 md:gap-4 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-white dark:text-black rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Desktop Dropdown */}
            {user ? (
              <div
                ref={dropdownRef}
                className="hidden md:flex items-center gap-2 relative"
              >
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-white dark:text-black hover:bg-primary/90 transition"
                >
                  {user.name}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-muted border rounded shadow-md py-2 z-50">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-muted">Profile</Link>
                    <Link to="/orders" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-muted">Orders</Link>

                    {user.role === "admin" && (
                      <>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <p className="px-4 py-1 text-xs text-muted-foreground">Admin Panel</p>
                        <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm hover:bg-muted">Dashboard</Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-muted text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
                <ModeToggle />
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login">
                  <Button variant="secondary" className="text-sm">Login</Button>
                </Link>
                <ModeToggle />
              </div>
            )}

            {/* Hamburger Icon */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
  {menuOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/20 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Slide-in Menu */}
      <motion.div
        className="fixed top-0 right-0 h-full w-64 bg-background z-50 shadow-lg p-6 flex flex-col justify-between"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
      >
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-lg font-medium hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>

            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
                {user.role === "admin" && (
                  <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-left text-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="secondary" className="w-full">Login</Button>
              </Link>
            )}
          </nav>
        </div>

        {/* ModeToggle always visible here too */}
        <div className="pt-6">
          <ModeToggle />
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>


      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/10 flex justify-center pt-24 px-4">
          <div
            ref={searchModalRef}
            className="w-full max-w-xl bg-white dark:bg-background shadow-xl border rounded-xl p-5 relative max-h-[420px] overflow-y-auto scrollbar-hidden"
          >
            <div className="relative mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                }}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <LiveProductResults
              query={query}
              onSelect={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ------------------------------
// LiveProductResults component
// ------------------------------
import type { Product } from "@/types/product";
import Fuse from "fuse.js";

function LiveProductResults({
  query,
  onSelect,
}: {
  query: string;
  onSelect: () => void;
}) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all products only once
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${API_BASE}/products/all`);
        const data = await res.json();
        setAllProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch all products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (!query.trim() || allProducts.length === 0) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(allProducts, {
      keys: ["name", "category"],
      threshold: 0.4, // smaller = stricter, higher = fuzzier
    });

    const matches = fuse.search(query).map((match) => match.item);
    setResults(matches);
  }, [query, allProducts]);

  if (!query.trim()) return null;

  return (
    <div className="max-h-80 overflow-y-auto space-y-2 scrollbar-hidden">
      {loading && <p className="text-sm text-muted-foreground">Loading products...</p>}
      {!loading && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No matching products.</p>
      )}
      {results.map((product) => (
        <div
          key={product._id}
          className="flex justify-between items-center p-2 rounded hover:bg-muted cursor-pointer"
          onClick={() => {
            navigate(`/products/${product._id}`);
            onSelect();
          }}
        >
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              {product.category} · ₹{product.price}
            </p>
          </div>
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="w-10 h-10 object-cover rounded-md"
          />
        </div>
      ))}
    </div>
  );
}