import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProducts } from "@/redux/slices/productSlice";
import ProductCard from "@/components/products/ProductCard";
import FiltersSidebar from "@/components/products/FiltersSidebar";
import Loader from "@/components/common/Loader";
import { useSearchParams } from "react-router-dom";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { products, total, loading, error } = useAppSelector(
    (state) => state.products
  );

  const [category, setCategory] = useState("All");
  const [rating, setRating] = useState(0);
  const [price, setPrice] = useState(0);
  const [page, setPage] = useState(1);
  const PRODUCTS_PER_PAGE = 6;

  const [searchParams] = useSearchParams();
  const searchQuery = useMemo(() => searchParams.get("search") || "", [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, rating, price]);

  // Fetch products when filters/search/page changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(
        fetchProducts({
          category,
          ratings: rating,
          price,
          page,
          limit: PRODUCTS_PER_PAGE,
          keyword: searchQuery,
        })
      );
    }, 150); // 150ms debounce to prevent double calls

    return () => clearTimeout(timeout); // cleanup on unmount or deps change
  }, [dispatch, category, rating, price, page, searchQuery]);

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);

  const resetFilters = () => {
    setCategory("All");
    setRating(0);
    setPrice(0);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Browse Products</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <FiltersSidebar
          selectedCategory={category}
          onCategoryChange={setCategory}
          selectedRating={rating}
          onRatingChange={setRating}
          selectedPrice={price}
          onPriceChange={setPrice}
          onClear={resetFilters}
        />

        <main className="flex-1">
          {loading ? (
             <div className="flex justify-center items-center h-screen text-xl">
             <Loader />
           </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    image={product.images[0]?.url || ""}
                    price={product.price}
                    rating={product.ratings}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center mt-4">
              No products found.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
