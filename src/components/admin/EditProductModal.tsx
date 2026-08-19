import { useState } from "react"
import { X, UploadCloud, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: { url: string }[]
}

interface Props {
  product: Product
  onClose: () => void
  onUpdated: () => void
}

export default function EditProductModal({ product, onClose, onUpdated }: Props) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description || "")
  const [price, setPrice] = useState(String(product.price))
  const [stock, setStock] = useState(String(product.stock))
  const [category, setCategory] = useState(product.category)
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !price || !stock || !category) {
      toast.error("Please fill in all required fields")
      return
    }

    const formData = new FormData()
    formData.append("name", name.trim())
    formData.append("description", description.trim())
    formData.append("price", price)
    formData.append("stock", stock)
    formData.append("category", category.trim())

    if (images.length > 0) {
      images.forEach((file) => formData.append("images", file))
    }

    const API_BASE = import.meta.env.VITE_API_BASE_URL

    try {
      setLoading(true)

      const res = await fetch(`${API_BASE}/products/${product._id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Failed to update product")
      }

      toast.success("Product updated successfully")
      onUpdated()
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message)
      } else {
        toast.error("An unknown error occurred while updating the product")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" /> Edit Product Details
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update product info, pricing, category, and inventory levels
            </p>
          </div>

          <button
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Product Title *</label>
            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-xs"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Description *</label>
            <textarea
              rows={3}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-xs resize-none"
              required
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Price (₹) *</label>
              <input
                type="number"
                placeholder="Price"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Stock *</label>
              <input
                type="number"
                placeholder="Stock"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-xs"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Category *</label>
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-xs"
              required
            />
          </div>

          {/* Replace/Add Images */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Update Images (Optional)</label>
            <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center bg-muted/10 hover:bg-muted/20 transition relative cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(Array.from(e.target.files || []))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-semibold text-foreground">
                Upload new image files to replace current images
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Leave empty to keep existing images
              </p>
              {images.length > 0 && (
                <div className="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                  {images.length} new image{images.length > 1 ? "s" : ""} selected
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl text-xs font-bold shadow-xs"
            >
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
