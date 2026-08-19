import { useState } from "react"
import { Plus, X, UploadCloud, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface Props {
  onProductCreated: () => void
  className?: string
}

export default function CreateProductModal({ onProductCreated, className }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setCategory("")
    setStock("")
    setImages([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !price || !category || !stock || images.length === 0) {
      toast.error("Please fill in all fields and select at least one product image")
      return
    }

    const formData = new FormData()
    formData.append("name", name.trim())
    formData.append("description", description.trim())
    formData.append("price", price)
    formData.append("category", category.trim())
    formData.append("stock", stock)
    images.forEach((file) => formData.append("images", file))

    const API_BASE = import.meta.env.VITE_API_BASE_URL
    try {
      setLoading(true)

      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || "Failed to create product")
        return
      }

      toast.success("Product created successfully!")
      setIsOpen(false)
      resetForm()
      onProductCreated()
    } catch (err) {
      console.error("Create Product Error:", err)
      toast.error("Something went wrong while creating the product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs ${className || ""}`}
      >
        <Plus className="w-4 h-4" />
        <span>Add Product</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Add New Catalog Product
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter product details, pricing, inventory stock, and upload images
                </p>
              </div>

              <button
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Product Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
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
                  placeholder="Provide detailed product specifications, highlights, and materials..."
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
                    placeholder="e.g. 1999"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Available Stock *</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
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
                  placeholder="e.g. Electronics, Footwear, Apparel, Accessories"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground text-xs"
                  required
                />
              </div>

              {/* Image Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Product Images *</label>
                <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center bg-muted/10 hover:bg-muted/20 transition relative cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files || []))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs font-semibold text-foreground">
                    Click or drag image files to upload
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    PNG, JPG, WEBP supported
                  </p>
                  {images.length > 0 && (
                    <div className="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                      {images.length} image{images.length > 1 ? "s" : ""} selected
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
                  onClick={() => setIsOpen(false)}
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
                  {loading ? "Creating Product..." : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
