import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

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

  const handleUpdate = async () => {
    if (!name || !description || !price || !stock || !category) {
      toast.error("Please fill all fields")
      return
    }

    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)
    formData.append("price", price)
    formData.append("stock", stock)
    formData.append("category", category)

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 text-black dark:text-white relative space-y-4">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold">Edit Product</h2>

        <div className="space-y-3">
          <input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
          />
          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
          />
          <input
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
          />
          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-zinc-200 dark:file:bg-zinc-700 dark:file:text-white"
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
      </div>
    </div>
  )
}
