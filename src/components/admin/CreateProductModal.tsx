import { useState } from "react"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"

interface Props {
  onProductCreated: () => void
}

export default function CreateProductModal({ onProductCreated }: Props) {
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

  const handleSubmit = async () => {
    if (!name || !description || !price || !category || !stock || images.length === 0) {
      toast.error("Please fill all fields and upload images")
      return
    }

    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)
    formData.append("price", price)
    formData.append("category", category)
    formData.append("stock", stock)
    images.forEach((file) => formData.append("images", file))
    
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
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

      toast.success("Product created successfully")
      setIsOpen(false)
      resetForm()
      onProductCreated() // ✅ Function runs fine if passed correctly
    } catch (err) {
      console.error("Create Product Error:", err)
      toast.error("Something went wrong while creating the product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        <Plus className="w-4 h-4" />
        Add Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-6 text-black dark:text-white relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

            <div className="space-y-3">
              <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white" />

              <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white" />

              <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white" />

              <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white" />

              <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white" />

              <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))} className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-zinc-200 dark:file:bg-zinc-700 dark:file:text-white" />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
