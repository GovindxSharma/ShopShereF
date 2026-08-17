import { Star, User, Trash2, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/redux/hooks"
import { deleteReview } from "@/redux/slices/reviewSlice"
import { toast } from "sonner"
import ConfirmModal from "@/components/common/ConfirmModal"

interface Review {
  _id?: string
  user: any
  name: string
  rating: number
  comment: string
  createdAt?: string
}

interface Props {
  reviews: Review[]
  productId?: string
}

export default function ReviewList({ reviews, productId }: Props) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!productId) return

    setDeleting(true)
    try {
      await dispatch(deleteReview(productId)).unwrap()
      toast.success("Review deleted successfully")
      setConfirmOpen(false)
    } catch {
      toast.error("Failed to delete review")
    } finally {
      setDeleting(false)
    }
  }

  if (!reviews || !reviews.length) {
    return (
      <div className="text-center py-10 border rounded-2xl bg-card p-6 space-y-2">
        <p className="text-sm font-semibold text-foreground">No customer reviews yet</p>
        <p className="text-xs text-muted-foreground">
          Have you purchased this product? Be the first to share your thoughts and rate it!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((review, i) => {
          const reviewerId = typeof review.user === "object" ? review.user?._id : review.user
          const isMyReview = user && user._id === reviewerId

          return (
            <div
              key={review._id || i}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-xs space-y-3 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {review.name ? review.name[0].toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-foreground">{review.name}</h4>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 bg-green-500/10 px-1.5 py-0.2 rounded-full font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3 h-3 ${
                            idx < review.rating
                              ? "fill-amber-500 stroke-amber-500"
                              : "stroke-gray-300 dark:stroke-gray-600"
                          }`}
                        />
                      ))}
                      <span className="text-[11px] font-bold ml-1 text-foreground">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>
                </div>

                {isMyReview && productId && (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition"
                    title="Delete my review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {review.comment}
              </p>
            </div>
          )
        })}
      </div>

      {/* Built-in Review Delete Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Review"
        message="Are you sure you want to delete your review? This action cannot be undone."
        confirmText="Delete Review"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}
