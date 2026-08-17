import { Star, X, Sparkles } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => void
  loading: boolean
}

const ratingLabels: Record<number, string> = {
  1: "1 Star - Poor",
  2: "2 Stars - Fair",
  3: "3 Stars - Good",
  4: "4 Stars - Very Good",
  5: "5 Stars - Excellent",
}

export default function ReviewModal({ open, onClose, onSubmit, loading }: Props) {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")

  if (!open) return null

  const activeRating = hoverRating || rating

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    onSubmit(rating, comment.trim())
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border/80 p-6 sm:p-7 rounded-3xl w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Write a Review
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share your honest product experience with other shoppers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rating selection */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-center py-2 bg-muted/20 rounded-2xl border">
            <label className="text-xs font-semibold text-muted-foreground block">
              Overall Score: <strong className="text-foreground">{ratingLabels[activeRating]}</strong>
            </label>
            <div className="flex justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 cursor-pointer transition-colors ${
                      star <= activeRating
                        ? "fill-amber-500 stroke-amber-500"
                        : "stroke-gray-300 dark:stroke-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Your Review / Feedback *
            </label>
            <textarea
              rows={4}
              required
              placeholder="What did you like or dislike about this product? How is the quality and sizing?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !comment.trim()}
              className="rounded-xl font-bold text-xs shadow-xs"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
