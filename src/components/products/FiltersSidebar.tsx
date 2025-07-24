import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedRating: number;
  onRatingChange: (val: number) => void;
  selectedPrice: number;
  onPriceChange: (val: number) => void;
  onClear: () => void;
}

export default function FiltersSidebar({
  selectedCategory,
  onCategoryChange,
  selectedRating,
  onRatingChange,
  selectedPrice,
  onPriceChange,
  onClear,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [manualPrice, setManualPrice] = useState(selectedPrice);
  const mobileRef = useRef<HTMLDivElement>(null);

  const categories = ["All", "Pants", "T-Shirts", "Shoes", "Accessories", "Bags"];
  const ratings = [5, 4, 3, 2, 1];

  const applyManualPrice = () => {
    onPriceChange(manualPrice);
  };

  useEffect(() => {
    if (!mobileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileRef.current &&
        !mobileRef.current.contains(event.target as Node)
      ) {
        applyManualPrice();
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, manualPrice]);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setMobileOpen(true)}
          className="flex gap-2 items-center"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Filters for Desktop */}
      <aside className="hidden md:block w-full md:w-64 border rounded-lg p-4 space-y-6 h-fit">
        <FiltersContent
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          ratings={ratings}
          selectedRating={selectedRating}
          onRatingChange={onRatingChange}
          selectedPrice={selectedPrice}
          onPriceChange={onPriceChange}
          manualPrice={manualPrice}
          setManualPrice={setManualPrice}
          applyManualPrice={applyManualPrice}
          onClear={onClear}
        />
      </aside>

      {/* Filters for Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div
            ref={mobileRef}
            className="w-80 bg-background p-4 space-y-6 overflow-y-auto h-full shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => {
                  applyManualPrice();
                  setMobileOpen(false);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FiltersContent
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={onCategoryChange}
              ratings={ratings}
              selectedRating={selectedRating}
              onRatingChange={onRatingChange}
              selectedPrice={selectedPrice}
              onPriceChange={onPriceChange}
              manualPrice={manualPrice}
              setManualPrice={setManualPrice}
              applyManualPrice={applyManualPrice}
              onClear={onClear}
            />
          </div>
        </div>
      )}
    </>
  );
}

// ✅ Helper Component: FiltersContent
function FiltersContent({
  categories,
  selectedCategory,
  onCategoryChange,
  ratings,
  selectedRating,
  onRatingChange,
  selectedPrice,
  onPriceChange,
  manualPrice,
  setManualPrice,
  applyManualPrice,
  onClear,
}: {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  ratings: number[];
  selectedRating: number;
  onRatingChange: (val: number) => void;
  selectedPrice: number;
  onPriceChange: (val: number) => void;
  manualPrice: number;
  setManualPrice: (val: number) => void;
  applyManualPrice: () => void;
  onClear: () => void;
}) {
  return (
    <>
      {/* Category Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Category</h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={selectedCategory === cat}
                onChange={() => onCategoryChange(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Minimum Rating</h3>
        <div className="space-y-1">
          {ratings.map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="rating"
                value={r}
                checked={selectedRating === r}
                onChange={() => onRatingChange(r)}
              />
              {r} ★ & up
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Max Price</h3>
        <input
          type="range"
          min={0}
          max={5000}
          step={100}
          value={selectedPrice}
          onChange={(e) => {
            onPriceChange(Number(e.target.value));
            setManualPrice(Number(e.target.value));
          }}
          className="w-full"
        />
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min={0}
            max={5000}
            step={100}
            value={manualPrice}
            onChange={(e) => setManualPrice(Number(e.target.value))}
            className="border rounded px-2 py-1 w-24 text-sm"
          />
          <Button size="sm" onClick={applyManualPrice}>
            Apply
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Up to ₹{selectedPrice}</p>
      </div>

      {/* Clear All Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2"
        onClick={onClear}
      >
        Clear All Filters
      </Button>
    </>
  );
}
