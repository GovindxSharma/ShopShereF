import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchProducts } from "@/redux/slices/productSlice"
import ProductCard from "@/components/products/ProductCard"
import Loader from "@/components/common/Loader"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Sparkles,
  Flame,
  Copy,
  Check,
  Star,
  ShoppingBag,
  Zap,
  Tag,
  Mail,
  Send,
} from "lucide-react"

// 🎨 5 Dedicated Offer-Specific Hero Slides with Real Photography
const heroSlides = [
  {
    id: 1,
    tag: "Mega Season Clearance",
    shortTitle: "Oversized Tees",
    discountTag: "60% OFF",
    discountBadge: "UP TO 60% OFF",
    title: "Signature Oversized Streetwear & Heavyweight Drops",
    description: "Engineered with 320 GSM heavyweight organic combed cotton, relaxed dropped shoulders, and ultra-durable streetwear styling.",
    buttonText: "Shop Megasale Drops",
    buttonLink: "/products?category=T-Shirts",
    offerCode: "SUMMER60",
    offerLabel: "Use code SUMMER60 for extra 60% Off",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600&auto=format&fit=crop",
    gradient: "from-slate-950 via-zinc-900/90 to-transparent",
    accentColor: "text-amber-300",
  },
  {
    id: 2,
    tag: "Limited Footwear Drop",
    shortTitle: "Street Kicks",
    discountTag: "₹800 OFF",
    discountBadge: "FLAT ₹800 OFF",
    title: "Cloud-Foam High-Tops & Performance Street Kicks",
    description: "Multi-density shock-absorbing rubber outsoles and breathable engineered mesh designed for maximum all-day agility.",
    buttonText: "Claim Sneaker Offer",
    buttonLink: "/products?category=Shoes",
    offerCode: "KICKS800",
    offerLabel: "Use code KICKS800 on all Footwear",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1600&auto=format&fit=crop",
    gradient: "from-blue-950 via-slate-900/90 to-transparent",
    accentColor: "text-cyan-300",
  },
  {
    id: 3,
    tag: "Technical Utility Rush",
    shortTitle: "Tactical Cargo",
    discountTag: "B1G1 50%",
    discountBadge: "BUY 1 GET 1 @ 50%",
    title: "Waterproof Tactical Cargoes & Relaxed Utility Joggers",
    description: "Reinforced ripstop cotton, 6 modular utility pockets, and elasticated ankle cuffs built for both outdoor and street lifestyles.",
    buttonText: "Explore Cargo Pants",
    buttonLink: "/products?category=Pants",
    offerCode: "CARGO50",
    offerLabel: "Buy 1 Get 1 at 50% with code CARGO50",
    image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=1600&auto=format&fit=crop",
    gradient: "from-emerald-950 via-stone-900/90 to-transparent",
    accentColor: "text-emerald-300",
  },
  {
    id: 4,
    tag: "Everyday Carry Specials",
    shortTitle: "EDC Bags",
    discountTag: "20% OFF",
    discountBadge: "EXTRA 20% OFF",
    title: "Minimalist Weatherproof EDC Backpacks & Tech Bags",
    description: "Hydrophobic coated ballistic nylon, padded 16-inch laptop sleeves, and quick-access magnetic buckle compartments.",
    buttonText: "Grab Travel Gear",
    buttonLink: "/products?category=Bags",
    offerCode: "CARRY20",
    offerLabel: "Use code CARRY20 for instant 20% discount",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1600&auto=format&fit=crop",
    gradient: "from-purple-950 via-slate-900/90 to-transparent",
    accentColor: "text-purple-300",
  },
  {
    id: 5,
    tag: "VIP Luxury Member Drop",
    shortTitle: "VIP Watches",
    discountTag: "₹1,000 OFF",
    discountBadge: "FLAT ₹1,000 OFF",
    title: "Precision Chronographs, Leather Wallets & Accessories",
    description: "Surgical-grade stainless steel timepieces and genuine full-grain leather accessories handcrafted for timeless elegance.",
    buttonText: "Shop VIP Accessories",
    buttonLink: "/products?category=Accessories",
    offerCode: "VIP1000",
    offerLabel: "Save flat ₹1,000 on orders above ₹2,999",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
    gradient: "from-rose-950 via-neutral-900/90 to-transparent",
    accentColor: "text-rose-300",
  },
]

// 🏷️ Category Cards Data
const categoryCards = [
  {
    name: "T-Shirts",
    label: "Graphic & Plain Tees",
    count: "40+ Styles",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Pants",
    label: "Cargoes & Chinos",
    count: "25+ Styles",
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Shoes",
    label: "Sneakers & Kicks",
    count: "30+ Models",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Bags",
    label: "EDC & Travel Bags",
    count: "18+ Designs",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop",
  },
  {
    name: "Accessories",
    label: "Watches & Gear",
    count: "20+ Items",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
  },
]

// 🎟️ Live Promo Vouchers Vault
const promoVouchers = [
  {
    code: "SHOPSHERE10",
    discount: "10% OFF",
    title: "Sitewide All Products",
    minSpend: "₹999 Min Spend",
    expiry: "Active Today",
    theme: "from-blue-600 to-indigo-700",
  },
  {
    code: "FREESHIP",
    discount: "FREE EXPRESS DELIVERY",
    title: "Zero Shipping Charges",
    minSpend: "₹499 Min Spend",
    expiry: "Limited Slots",
    theme: "from-emerald-600 to-teal-700",
  },
  {
    code: "FESTIVE20",
    discount: "FLAT ₹500 OFF",
    title: "Grand Seasonal Megasale",
    minSpend: "₹2,499 Min Spend",
    expiry: "Weekend Special",
    theme: "from-purple-600 to-pink-700",
  },
  {
    code: "VIP1000",
    discount: "FLAT ₹1,000 OFF",
    title: "Luxury & Accessories Bundle",
    minSpend: "₹2,999 Min Spend",
    expiry: "Exclusive Pass",
    theme: "from-amber-600 to-rose-700",
  },
]

// ⭐ Testimonials
const testimonials = [
  {
    name: "Ananya Sharma",
    location: "Mumbai",
    rating: 5,
    tag: "Verified Buyer",
    comment: "The oversized tee quality is insane. Heavyweight cotton, perfect boxy fit, and delivered in just 2 days with real AWB updates!",
    product: "Vintage Graphic Tee",
  },
  {
    name: "Rohan Varma",
    location: "Bengaluru",
    rating: 5,
    tag: "Verified Buyer",
    comment: "Sneakers look 10x better in person than photos. Super comfortable cloud cushioning and seamless payment checkout.",
    product: "High-Top Street Kicks",
  },
  {
    name: "Pooja Mehta",
    location: "Delhi",
    rating: 5,
    tag: "Verified Buyer",
    comment: "Applied the SHOPSHERE10 coupon instantly at checkout and got real-time tracking updates directly on WhatsApp!",
    product: "Minimalist Utility Backpack",
  },
]

export default function Home() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { products, loading, error } = useAppSelector((state) => state.products)

  // 🎠 Carousel State
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  // 📱 Touch Swipe State for Hero Carousel
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // ⏱️ Live Flash Sale Countdown Clock
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 38, seconds: 22 })

  useEffect(() => {
    dispatch(fetchProducts({ limit: 16 }))
  }, [dispatch])

  // ⏱️ Flash Timer Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 6, minutes: 0, seconds: 0 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // ⏱️ Auto-play Hero Carousel every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  // 📱 Touch Gesture Handlers for Mobile Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    if (isLeftSwipe) {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length)
    }
    if (isRightSwipe) {
      setCurrentHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success(`Coupon code ${code} copied to clipboard!`)
    setTimeout(() => setCopiedCode(null), 3000)
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    setNewsletterSubscribed(true)
    toast.success("Welcome to ShopSphere VIP! Your ₹200 Welcome Voucher is unlocked.")
  }

  const currentSlide = heroSlides[currentHeroIndex]

  return (
    <main className="space-y-12 sm:space-y-20 pb-28 sm:pb-20 overflow-hidden">
      {/* ========================================================================= */}
      {/* 🌟 1. ELEGANT TOUCH-SWIPE HERO SHOWCASE WITH 5 INTERACTIVE SLIDE TABS */}
      {/* ========================================================================= */}
      <section
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full overflow-hidden bg-black text-white min-h-[620px] sm:min-h-[680px] lg:min-h-[720px] flex flex-col justify-between pt-8 sm:pt-14 pb-5 sm:pb-8 select-none"
      >
        {/* Background Image Carousel with Fade Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Multi-layer High-Contrast Gradient Scrim Overlays */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.gradient}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40 sm:to-transparent" />
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px]" />
          </motion.div>
        </AnimatePresence>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
          <div className="max-w-2xl space-y-3.5 sm:space-y-4.5">
            {/* Badges Row */}
            <motion.div
              key={`badge-${currentSlide.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                {currentSlide.discountBadge}
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                {currentSlide.tag}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              key={`title-${currentSlide.id}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white drop-shadow-md"
            >
              {currentSlide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              key={`desc-${currentSlide.id}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="text-xs sm:text-sm md:text-base text-zinc-100 leading-relaxed font-medium line-clamp-2 sm:line-clamp-3 drop-shadow-sm max-w-xl"
            >
              {currentSlide.description}
            </motion.p>

            {/* Offer Code 1-Click Voucher Bar */}
            <motion.div
              key={`voucher-${currentSlide.id}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="p-2.5 sm:p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-between gap-3 max-w-md shadow-xl"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-xs text-zinc-100 font-semibold truncate">
                  Code: <strong className="text-amber-300 font-mono font-black tracking-wide">{currentSlide.offerCode}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCode(currentSlide.offerCode)}
                className="px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 text-[11px] sm:text-xs font-black shadow-sm active:scale-95 transition shrink-0 flex items-center gap-1.5"
              >
                {copiedCode === currentSlide.offerCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600 stroke-[3]" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-900" /> Copy Code
                  </>
                )}
              </button>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              key={`btn-${currentSlide.id}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.28 }}
              className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1.5 sm:pt-2.5"
            >
              <Button
                size="lg"
                onClick={() => navigate(currentSlide.buttonLink)}
                className="rounded-full px-6 sm:px-8 font-black shadow-xl bg-white hover:bg-zinc-100 text-zinc-950 flex items-center gap-2 h-10 sm:h-12 text-xs sm:text-sm transition transform hover:scale-[1.02]"
              >
                <ShoppingBag className="w-4 h-4 text-zinc-950" /> {currentSlide.buttonText} <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/products")}
                className="rounded-full px-5 sm:px-6 font-bold bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-md h-10 sm:h-12 text-xs sm:text-sm shadow-md"
              >
                Explore Catalog
              </Button>
            </motion.div>
          </div>
        </div>

        {/* 🌟 Responsive Carousel Controls (Mobile Segmented Bar + Desktop Luxury Cards) */}
        <div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full mt-6 sm:mt-10">
          {/* Mobile Controller (< sm) */}
          <div className="block sm:hidden space-y-3">
            {/* 5 Progress Bars */}
            <div className="grid grid-cols-5 gap-2">
              {heroSlides.map((slide, i) => {
                const isActive = currentHeroIndex === i

                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentHeroIndex(i)}
                    className="py-1.5 focus:outline-none cursor-pointer"
                    aria-label={`Go to slide ${i + 1}: ${slide.shortTitle}`}
                  >
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                      {isActive ? (
                        <motion.div
                          key={`bar-mobile-${currentHeroIndex}`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 5.5, ease: "linear" }}
                          className="h-full bg-amber-400 rounded-full"
                        />
                      ) : (
                        <div
                          className={`h-full ${
                            i < currentHeroIndex ? "bg-white/40" : "w-0"
                          }`}
                        />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Active Slide Pill */}
            <div className="flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-2 rounded-2xl">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-mono font-black text-amber-300 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 shrink-0">
                  0{currentHeroIndex + 1} / 0{heroSlides.length}
                </span>
                <span className="text-xs font-bold text-white truncate">
                  {currentSlide.shortTitle}
                </span>
              </div>

              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 shadow-xs shrink-0">
                {currentSlide.discountTag}
              </span>
            </div>
          </div>

          {/* Desktop Controller (sm and above) */}
          <div className="hidden sm:grid sm:grid-cols-5 gap-3">
            {heroSlides.map((slide, i) => {
              const isActive = currentHeroIndex === i

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentHeroIndex(i)}
                  className={`text-left p-3 rounded-2xl backdrop-blur-md transition-all duration-300 relative border flex flex-col justify-between overflow-hidden group cursor-pointer ${
                    isActive
                      ? "bg-black/85 border-amber-400/90 ring-2 ring-amber-400/40 shadow-2xl scale-[1.01]"
                      : "bg-black/55 hover:bg-black/75 border-white/20 hover:border-white/40 shadow-md"
                  }`}
                >
                  {/* Progress Fill Line */}
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mb-2">
                    {isActive ? (
                      <motion.div
                        key={`bar-${currentHeroIndex}`}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5.5, ease: "linear" }}
                        className="h-full bg-amber-400 rounded-full shadow-xs"
                      />
                    ) : (
                      <div className="h-full w-0" />
                    )}
                  </div>

                  {/* Header Row: Index Number & Discount Tag */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] font-mono font-black ${
                        isActive ? "text-amber-300" : "text-white/60"
                      }`}
                    >
                      0{i + 1}
                    </span>

                    <span
                      className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-amber-400 text-zinc-950 font-black shadow-xs"
                          : "bg-white/15 text-white/90"
                      }`}
                    >
                      {slide.discountTag}
                    </span>
                  </div>

                  {/* Title Label */}
                  <p
                    className={`text-xs font-black tracking-tight truncate pt-1 transition-colors ${
                      isActive ? "text-white" : "text-white/80 group-hover:text-white"
                    }`}
                  >
                    {slide.shortTitle}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ⏱️ 2. LIVE FLASH DEALS TICKING COUNTDOWN BANNER */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-xs">
              <Flame className="w-3.5 h-3.5 text-amber-300" /> Lightning Flash Sale
            </div>
            <h3 className="text-xl sm:text-3xl font-black tracking-tight">
              Extra 10% Off Instant Sitewide
            </h3>
            <p className="text-xs sm:text-sm text-white/90">
              Apply code <strong className="font-mono underline font-black">SHOPSHERE10</strong> at checkout.
            </p>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center justify-center w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20">
              <span className="text-base sm:text-xl font-black font-mono leading-none">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-white/70 mt-0.5">Hours</span>
            </div>
            <span className="text-xl font-black font-mono">:</span>
            <div className="flex flex-col items-center justify-center w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20">
              <span className="text-base sm:text-xl font-black font-mono leading-none">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-white/70 mt-0.5">Mins</span>
            </div>
            <span className="text-xl font-black font-mono">:</span>
            <div className="flex flex-col items-center justify-center w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20">
              <span className="text-base sm:text-xl font-black font-mono leading-none text-amber-300">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase font-bold text-white/70 mt-0.5">Secs</span>
            </div>
          </div>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/products")}
            className="rounded-full px-6 sm:px-8 font-black shadow-lg text-xs sm:text-sm h-10 sm:h-11 w-full md:w-auto"
          >
            Claim Flash Deal <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🚀 3. VALUE PROPOSITIONS STRIP */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 p-3.5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-4 p-2">
            <div className="p-2 sm:p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
              <Truck className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-foreground">Express Delivery</h4>
              <p className="text-[9px] sm:text-xs text-muted-foreground">Fast shipping with live AWB tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 p-2">
            <div className="p-2 sm:p-3 rounded-2xl bg-green-500/10 text-green-600 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-foreground">100% Genuine</h4>
              <p className="text-[9px] sm:text-xs text-muted-foreground">Authentic, verified quality items</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 p-2">
            <div className="p-2 sm:p-3 rounded-2xl bg-blue-500/10 text-blue-600 shrink-0">
              <RotateCcw className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-foreground">7-Day Returns</h4>
              <p className="text-[9px] sm:text-xs text-muted-foreground">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 p-2">
            <div className="p-2 sm:p-3 rounded-2xl bg-purple-500/10 text-purple-600 shrink-0">
              <Headphones className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-foreground">24/7 AI Support</h4>
              <p className="text-[9px] sm:text-xs text-muted-foreground">Instant smart chat & order lookup</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🏷️ 4. TRENDING CATEGORIES KINETIC HORIZONTAL SWIPE REEL */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="flex justify-between items-end border-b pb-3.5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Curated Departments
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-foreground mt-0.5">
              Explore Collections
            </h2>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            All Departments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Reel — Pure Kinetic Touch Scroll (No clunky arrows!) */}
        <div
          className="flex gap-3.5 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categoryCards.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/products?category=${cat.name}`)}
              className="group relative flex-none w-44 sm:w-60 h-56 sm:h-72 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 snap-start"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-5 text-white space-y-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 block">
                  {cat.count}
                </span>
                <h3 className="font-extrabold text-sm sm:text-lg leading-tight text-white group-hover:text-primary transition">
                  {cat.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-white/70">{cat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🎟️ 5. PROMOTIONAL COUPONS VAULT */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Active Discounts & Promo Codes
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-foreground">
            Save Extra on Your Order
          </h2>
          <p className="text-xs text-muted-foreground">
            Tap any promo code to copy and apply automatically at checkout
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {promoVouchers.map((voucher) => {
            const isCopied = copiedCode === voucher.code

            return (
              <div
                key={voucher.code}
                className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 bg-gradient-to-br ${voucher.theme} text-white shadow-lg flex flex-col justify-between space-y-3.5 transition hover:scale-[1.02]`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-lg sm:text-2xl font-black tracking-tight">{voucher.discount}</span>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                      {voucher.expiry}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white/90 line-clamp-1">{voucher.title}</h4>
                  <p className="text-[10px] sm:text-[11px] text-white/75">{voucher.minSpend}</p>
                </div>

                <div className="flex justify-between items-center bg-black/25 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border border-white/20">
                  <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-amber-300">
                    {voucher.code}
                  </span>

                  <button
                    onClick={() => handleCopyCode(voucher.code)}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-xl bg-white text-black text-[10px] sm:text-[11px] font-extrabold shadow-sm hover:bg-white/90 active:scale-95 transition"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🔥 6. FEATURED DROPS HORIZONTAL PRODUCT SWIPE RAIL */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="flex justify-between items-end border-b pb-3.5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Trending Right Now
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight text-foreground mt-0.5">
              Featured Products
            </h2>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View Full Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Smooth Snap Swipe Track (No clunky arrows!) */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            <p>Error loading featured catalog: {error}</p>
          </div>
        ) : products.length > 0 ? (
          <div
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div key={product._id} className="flex-none w-60 sm:w-72 snap-start">
                <ProductCard
                  id={product._id}
                  name={product.name}
                  image={product.images?.[0]?.url || product.images?.[0] || ""}
                  price={product.price}
                  rating={product.ratings}
                  category={product.category}
                  stock={product.stock}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-3xl bg-card">
            <p className="text-muted-foreground font-medium">No products currently available.</p>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 👑 7. VIP EARLY ACCESS CLUB SIGNUP */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-zinc-900 to-black text-white p-6 sm:p-12 border border-border/40 shadow-2xl">
          <div className="max-w-xl space-y-3.5 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-black uppercase tracking-wider border border-primary/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> VIP Member Access
            </div>
            <h3 className="text-xl sm:text-4xl font-black tracking-tight text-white">
              Unlock ₹200 Off Your First Order
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Join the ShopSphere Insiders Club to receive secret promo drops, limited release alerts, and member-exclusive discount codes.
            </p>

            {newsletterSubscribed ? (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>You're in! Use coupon code <strong className="font-mono font-black text-white bg-white/10 px-2 py-0.5 rounded">VIPNEW20</strong> at checkout.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-2xl font-black text-xs sm:text-sm h-10 sm:h-11 px-5 sm:px-6 shadow-lg bg-primary hover:bg-primary/90 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Unlock Voucher
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🌟 8. SOCIAL PROOF & CUSTOMER REVIEWS */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Verified Buyer Experiences
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-foreground">
            Loved by Over 10,000+ Customers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 pt-1">
          {testimonials.map((review, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-3xl bg-card border border-border/70 shadow-2xs space-y-3.5 flex flex-col justify-between transition hover:border-primary/40"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: review.rating }).map((_, r) => (
                    <Star key={r} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="flex justify-between items-center border-t pt-3 text-xs">
                <div>
                  <h5 className="font-extrabold text-foreground">{review.name}</h5>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground">{review.location}</span>
                </div>

                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                  {review.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
