import { Star } from "lucide-react"
import { Link } from "react-router-dom"

interface Props {
  id: string
  name: string
  image?: string
  price: number
  rating: number
  category?: string
}

export default function ProductCard({
  id,
  name,
  image = "",
  price,
  rating,
  category,
}: Props) {
  return (
    <div className="rounded-xl border bg-background shadow-sm hover:shadow-md transition duration-300 overflow-hidden">
      <Link to={`/products/${id}`} className="block">
        {/* Product Image */}
        <div className="relative h-52 flex items-center justify-center bg-muted">
          <img
            src={image}
            alt={name}
            className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
            onError={(e) =>
              ((e.target as HTMLImageElement).src =
                "https://via.placeholder.com/300x200?text=No+Image")
            }
          />
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-2">
          {/* Category */}
          {category && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide text-center">
              {category}
            </p>
          )}

          {/* Name */}
          <h3 className="text-center text-base font-semibold text-foreground line-clamp-2 leading-snug">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating ? "fill-yellow-500 stroke-yellow-500" : "stroke-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-xs text-muted-foreground">({rating})</span>
          </div>

          {/* Price */}
          <div className="pt-2 text-center">
            <span className="text-xl font-bold text-primary">
              ₹{price.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
