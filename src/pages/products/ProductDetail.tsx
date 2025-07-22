import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addToCart } from "@/redux/slices/cartSlice";
import {
  fetchReviews,
  submitReview,
  selectReviews,
  resetReviewSuccess,
} from "@/redux/slices/reviewSlice";
import { toast } from "sonner";
import ReviewModal from "@/components/reviews/ReviewModal";
import ReviewList from "@/components/reviews/ReviewList";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "@/components/common/Loader";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const {
    reviews,
    loading: reviewLoading,
    success: reviewSuccess,
    error: reviewError,
  } = useAppSelector(selectReviews);

  const { user } = useAppSelector((state) => state.auth);

  const [sliderRef, sliderInstanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 1 },
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error loading product");
      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
      dispatch(fetchReviews(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (reviewSuccess) {
      toast.success("Review submitted successfully");
      setReviewModalOpen(false);
      dispatch(fetchReviews(id!));
      dispatch(resetReviewSuccess());
    }
  }, [reviewSuccess, dispatch, id]);

  useEffect(() => {
    if (reviewError) {
      toast.error(reviewError);
    }
  }, [reviewError]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!user) {
      toast.warning("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    try {
      await dispatch(addToCart(product)).unwrap();
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!id) return;
    await dispatch(submitReview({ productId: id, rating, comment }));
  };

  if (loading) return <Loader />;
  if (error) return <p className="p-10 text-red-500">Error: {error}</p>;
  if (!product) return <p className="p-10">Product not found.</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Image Section */}
        <div className="w-full md:w-1/2 relative">
          {product.images?.length > 1 ? (
            <>
              <div
                ref={sliderRef}
                className="keen-slider rounded-xl overflow-hidden h-[400px] bg-muted"
              >
                {product.images.map((img: any, i: number) => (
                  <div
                    key={i}
                    className="keen-slider__slide flex items-center justify-center h-full"
                  >
                    <img
                      src={img.url}
                      alt={`Product image ${i + 1}`}
                      className="object-contain max-h-full max-w-full"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/300x200?text=No+Image")
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => sliderInstanceRef.current?.prev()}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 p-1 rounded-full shadow"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => sliderInstanceRef.current?.next()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 p-1 rounded-full shadow"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="h-[400px] bg-muted flex items-center justify-center rounded-xl">
              <img
                src={product.images?.[0]?.url || ""}
                alt={product.name}
                className="object-contain max-h-full max-w-full"
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>

          <p className="text-xl font-semibold text-primary">
            ₹{product.price.toLocaleString()}
          </p>

          {product.stock === 0 ? (
            <p className="text-red-500 font-medium">Out of Stock</p>
          ) : (
            <p className="text-green-600 font-medium">
              In Stock ({product.stock} available)
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            Category: {product.category}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) =>
              i < Math.round(product.ratings) ? (
                <span key={i} className="text-yellow-500">
                  ★
                </span>
              ) : (
                <span key={i} className="text-gray-300">
                  ★
                </span>
              )
            )}
            <span className="text-sm text-muted-foreground">
              ({product.numOfReviews} review
              {product.numOfReviews !== 1 ? "s" : ""})
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-primary text-white dark:text-black px-6 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
            disabled={product.stock === 0}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="flex justify-between items-center border-t pt-6">
        <h2 className="text-2xl font-semibold">Customer Reviews</h2>
        <button
          onClick={() => setReviewModalOpen(true)}
          className="bg-primary text-white dark:text-black px-4 py-2 text-sm rounded hover:bg-primary/90"
        >
          Write a Review
        </button>
      </div>

      <ReviewList reviews={reviews || []} />

      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
        loading={reviewLoading}
      />
    </div>
  );
}
