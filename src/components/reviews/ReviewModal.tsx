import { Star } from "lucide-react"
import { useState } from "react"

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => void
  loading: boolean
}

export default function ReviewModal({ open, onClose, onSubmit, loading }: Props) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-background p-6 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Submit a Review</h2>

        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              onClick={() => setRating(star)}
              className={`w-6 h-6 cursor-pointer ${
                rating >= star ? "fill-yellow-500 stroke-yellow-500" : "stroke-gray-300"
              }`}
            />
          ))}
        </div>

        <textarea
          rows={4}
          placeholder="Write your thoughts..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={() => onSubmit(rating, comment)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  )
}
