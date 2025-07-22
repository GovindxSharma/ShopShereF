import { Star } from "lucide-react"

interface Review {
  _id?: string
  user: string
  name: string
  rating: number
  comment: string
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return <p className="text-muted-foreground">No reviews yet. Be the first to write one!</p>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {reviews.map((review) => (
        <div key={review._id} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-foreground">{review.name}</h4>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating ? "fill-yellow-500 stroke-yellow-500" : "stroke-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{review.comment}</p>
        </div>
      ))}
    </div>
  )
}
