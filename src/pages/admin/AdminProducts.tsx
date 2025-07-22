import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Pencil, Trash2, XCircle, Home } from "lucide-react"
import CreateProductModal from "@/components/admin/CreateProductModal"
import EditProductModal from "@/components/admin/EditProductModal"
import type { Product } from "@/types/product"
import Loader from "@/components/common/Loader"

const AdminProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL

  const fetchProducts = async () => {
    try {
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
    if (!deleteProductId) return

    try {
      const res = await fetch(`${API_BASE}/products/${deleteProductId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Delete failed")

      setProducts((prev) => prev.filter((p) => p._id !== deleteProductId))
      toast.success("Product deleted")
    } catch {
      toast.error("Failed to delete product")
    } finally {
      setDeleteProductId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      {/* 🔙 Back Button */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/dashboard")}
          className="flex gap-2 items-center"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <CreateProductModal onProductCreated={fetchProducts} />
      </div>

      <h1 className="text-2xl font-bold mt-4">📦 Manage Products</h1>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="border rounded-lg p-4 space-y-2">
              <img
                src={product.images?.[0]?.url || "/placeholder.png"}
                alt={product.name}
                className="h-40 object-cover w-full rounded-md"
              />
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-sm text-muted-foreground">₹{product.price}</p>
              <p className="text-sm">Stock: {product.stock}</p>
              <p className="text-xs text-muted-foreground">Category: {product.category}</p>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex gap-1"
                  onClick={() => setEditProduct(product)}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteProductId(product._id)}
                  className="flex gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✏️ Edit Modal */}
      {editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onUpdated={fetchProducts}
        />
      )}

      {/* ❌ Delete Confirmation */}
      {deleteProductId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <XCircle className="w-10 h-10 mx-auto text-red-500 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Delete this product?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="ghost" onClick={() => setDeleteProductId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
