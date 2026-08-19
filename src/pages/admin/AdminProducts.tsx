import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Pencil,
  Trash2,
  Home,
  Box,
  Search,
  RefreshCw,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react"
import CreateProductModal from "@/components/admin/CreateProductModal"
import EditProductModal from "@/components/admin/EditProductModal"
import ConfirmModal from "@/components/common/ConfirmModal"
import type { Product } from "@/types/product"
import { Skeleton } from "@/components/ui/skeleton"

const AdminProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/products/admin`, {
        credentials: "include",
      })
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const confirmDelete = async () => {
    if (!productToDelete) return

    try {
      setDeleting(true)
      const res = await fetch(`${API_BASE}/products/${productToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Delete failed")

      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id))
      toast.success("Product deleted successfully")
      setProductToDelete(null)
    } catch {
      toast.error("Failed to delete product")
    } finally {
      setDeleting(false)
    }
  }

  // Extract unique categories
  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center border-b pb-5">
        <div className="space-y-1.5">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
              className="rounded-xl text-xs text-muted-foreground hover:text-foreground -ml-2.5 h-7 px-2 flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Button>
            <span className="text-muted-foreground/30 text-xs">/</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Inventory
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Store Products Catalog
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Add new inventory, modify pricing, update stock numbers, and manage catalog items
          </p>
        </div>

        {/* Action Buttons: Clean on both Mobile and Desktop */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={loading}
            className="rounded-xl text-xs flex items-center justify-center gap-1.5 h-9 px-3 shrink-0"
            title="Refresh product list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
            className="rounded-xl text-xs hidden sm:flex items-center gap-1.5 font-semibold h-9 px-3.5"
          >
            <Home className="w-3.5 h-3.5" /> Back to Dashboard
          </Button>

          <div className="flex-1 sm:flex-initial">
            <CreateProductModal
              onProductCreated={fetchProducts}
              className="w-full sm:w-auto h-9"
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-card p-3.5 sm:p-4 rounded-2xl border shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products by title, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hidden py-1">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "hover:bg-muted text-muted-foreground bg-card border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-3xl p-4 space-y-3 bg-card">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 border rounded-3xl bg-card p-8 space-y-4">
          <Box className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
          <h3 className="text-lg font-bold text-foreground">No Products Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchTerm || categoryFilter !== "all"
              ? "No catalog items matched your active search query or filter."
              : "You have not added any products to the store yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0
            const isLowStock = product.stock > 0 && product.stock <= 5

            return (
              <div
                key={product._id}
                className="group border rounded-3xl p-4 bg-card shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative"
              >
                {/* Product Image */}
                <div className="relative w-full h-44 rounded-2xl bg-muted/40 overflow-hidden border p-2 flex items-center justify-center">
                  <img
                    src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop"}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop"
                    }}
                  />

                  {/* Stock Status Badge */}
                  <span
                    className={`absolute top-2.5 right-2.5 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${
                      isOutOfStock
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : isLowStock
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : isLowStock ? `Low (${product.stock})` : `Stock: ${product.stock}`}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {product.category || "General"}
                  </span>
                  <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {product.description || "No description provided."}
                  </p>
                </div>

                {/* Price & Action Row */}
                <div className="pt-2 border-t flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">Price</span>
                    <span className="text-base font-black text-foreground">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditProduct(product)}
                      className="rounded-xl px-2.5 py-1 text-xs gap-1 font-semibold hover:bg-muted"
                      title="Edit Product"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProductToDelete(product)}
                      className="rounded-xl p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onUpdated={fetchProducts}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(productToDelete)}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action permanently removes the product and cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  )
}

export default AdminProducts
