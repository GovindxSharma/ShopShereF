import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { fetchProducts } from "@/redux/slices/productSlice"
import ProductCard from "@/components/products/ProductCard"
import { ProductHorizontalTrackSkeleton } from "@/components/common/Skeletons"
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
  Mail,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// 🎨 5 Dedicated Offer-Specific Hero Slides with Real Photography
const heroSlides = [
  {
    id: 1,
    tag: "Mega Season Clearance",
    kicker: "FW26 // DROP 01",
    shortTitle: "Oversized Tees",
    discountTag: "60% OFF",
    discountBadge: "UP TO 60% OFF",
    title: "Signature Oversized Streetwear & Heavyweight Drops",
    description: "Engineered with 320 GSM heavyweight organic combed cotton, relaxed dropped shoulders, and ultra-durable streetwear styling.",
    buttonText: "Shop Megasale Drops",
    buttonLink: "/products?category=T-Shirts",
    offerCode: "SUMMER60",
    offerLabel: "Use code SUMMER60 for extra 60% Off",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=75&w=900&auto=format&fit=crop",
    gradient: "from-amber-950/75 via-amber-900/25 to-transparent",
    accentColor: "text-amber-400",
    accentBg: "bg-amber-400",
    accentBorder: "border-amber-400/60",
    accentGlow: "bg-amber-500/25",
  },
  {
    id: 2,
    tag: "Limited Footwear Drop",
    kicker: "LIMITED RUN // 500 PAIRS",
    shortTitle: "Street Kicks",
    discountTag: "₹800 OFF",
    discountBadge: "FLAT ₹800 OFF",
    title: "Cloud-Foam High-Tops & Performance Street Kicks",
    description: "Multi-density shock-absorbing rubber outsoles and breathable engineered mesh designed for maximum all-day agility.",
    buttonText: "Claim Sneaker Offer",
    buttonLink: "/products?category=Shoes",
    offerCode: "KICKS800",
    offerLabel: "Use code KICKS800 on all Footwear",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=75&w=900&auto=format&fit=crop",
    gradient: "from-cyan-950/75 via-sky-900/25 to-transparent",
    accentColor: "text-cyan-400",
    accentBg: "bg-cyan-400",
    accentBorder: "border-cyan-400/60",
    accentGlow: "bg-cyan-500/25",
  },
  {
    id: 3,
    tag: "Technical Utility Rush",
    kicker: "MODULAR CARGO // UTILITY",
    shortTitle: "Tactical Cargo",
    discountTag: "B1G1 50%",
    discountBadge: "BUY 1 GET 1 @ 50%",
    title: "Waterproof Tactical Cargoes & Relaxed Utility Joggers",
    description: "Reinforced ripstop cotton, 6 modular utility pockets, and elasticated ankle cuffs built for both outdoor and street lifestyles.",
    buttonText: "Explore Cargo Pants",
    buttonLink: "/products?category=Pants",
    offerCode: "CARGO50",
    offerLabel: "Buy 1 Get 1 at 50% with code CARGO50",
    image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=75&w=900&auto=format&fit=crop",
    gradient: "from-emerald-950/75 via-teal-900/25 to-transparent",
    accentColor: "text-emerald-400",
    accentBg: "bg-emerald-400",
    accentBorder: "border-emerald-400/60",
    accentGlow: "bg-emerald-500/25",
  },
  {
    id: 4,
    tag: "Everyday Carry Specials",
    kicker: "WEATHERPROOF // CORDURA",
    shortTitle: "EDC Bags",
    discountTag: "20% OFF",
    discountBadge: "EXTRA 20% OFF",
    title: "Minimalist Weatherproof EDC Backpacks & Tech Bags",
    description: "Hydrophobic coated ballistic nylon, padded 16-inch laptop sleeves, and quick-access magnetic buckle compartments.",
    buttonText: "Grab Travel Gear",
    buttonLink: "/products?category=Bags",
    offerCode: "CARRY20",
    offerLabel: "Use code CARRY20 for instant 20% discount",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=75&w=900&auto=format&fit=crop",
    gradient: "from-purple-950/75 via-indigo-900/25 to-transparent",
    accentColor: "text-purple-400",
    accentBg: "bg-purple-400",
    accentBorder: "border-purple-400/60",
    accentGlow: "bg-purple-500/25",
  },
  {
    id: 5,
    tag: "VIP Luxury Member Drop",
    kicker: "HANDCRAFTED // STEEL & LEATHER",
    shortTitle: "VIP Watches",
    discountTag: "₹1,000 OFF",
    discountBadge: "FLAT ₹1,000 OFF",
    title: "Precision Chronographs, Leather Wallets & Accessories",
    description: "Surgical-grade stainless steel timepieces and genuine full-grain leather accessories handcrafted for timeless elegance.",
    buttonText: "Shop VIP Accessories",
    buttonLink: "/products?category=Accessories",
    offerCode: "VIP1000",
    offerLabel: "Save flat ₹1,000 on orders above ₹2,999",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=75&w=900&auto=format&fit=crop",
    gradient: "from-rose-950/75 via-rose-900/25 to-transparent",
    accentColor: "text-rose-400",
    accentBg: "bg-rose-400",
    accentBorder: "border-rose-400/60",
    accentGlow: "bg-rose-500/25",
  },
]

// 🏷️ Category Cards Data
const categoryCards = [
  {
    name: "T-Shirts",
    label: "Graphic & Plain Tees",
    count: "40+ Styles",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=70&w=350&auto=format&fit=crop",
  },
  {
    name: "Pants",
    label: "Cargoes & Chinos",
    count: "25+ Styles",
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?q=70&w=350&auto=format&fit=crop",
  },
  {
    name: "Shoes",
    label: "Sneakers & Kicks",
    count: "30+ Models",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=70&w=350&auto=format&fit=crop",
  },
  {
    name: "Bags",
    label: "EDC & Travel Bags",
    count: "18+ Designs",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=70&w=350&auto=format&fit=crop",
  },
  {
    name: "Accessories",
    label: "Watches & Gear",
    count: "20+ Items",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=70&w=350&auto=format&fit=crop",
  },
]

// 🎟️ Live Promo Vouchers Vault (Light Shade Palette, Simple, Premium & Professional)
const promoVouchers = [
  {
    code: "SHOPSHERE10",
    discount: "10% OFF",
    title: "Sitewide All Products",
    minSpend: "Min spend ₹999",
    expiry: "Active Today",
    badge: "Most Popular",
    borderClass: "border-amber-500/20 hover:border-amber-500/40",
    bgClass: "bg-amber-500/[0.03] dark:bg-amber-400/[0.05]",
    badgeClass: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20",
    accentClass: "text-amber-700 dark:text-amber-400",
    glowClass: "bg-amber-500/10",
  },
  {
    code: "FREESHIP",
    discount: "FREE EXPRESS DELIVERY",
    title: "Zero Shipping Charges",
    minSpend: "Min spend ₹499",
    expiry: "Limited Slots",
    badge: "Auto Applied",
    borderClass: "border-emerald-500/20 hover:border-emerald-500/40",
    bgClass: "bg-emerald-500/[0.03] dark:bg-emerald-400/[0.05]",
    badgeClass: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20",
    accentClass: "text-emerald-700 dark:text-emerald-400",
    glowClass: "bg-emerald-500/10",
  },
  {
    code: "FESTIVE20",
    discount: "FLAT ₹500 OFF",
    title: "Grand Seasonal Megasale",
    minSpend: "Min spend ₹2,499",
    expiry: "Weekend Special",
    badge: "Limited Run",
    borderClass: "border-sky-500/20 hover:border-sky-500/40",
    bgClass: "bg-sky-500/[0.03] dark:bg-sky-400/[0.05]",
    badgeClass: "bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20",
    accentClass: "text-sky-700 dark:text-sky-400",
    glowClass: "bg-sky-500/10",
  },
  {
    code: "VIP1000",
    discount: "FLAT ₹1,000 OFF",
    title: "Luxury & Accessories Bundle",
    minSpend: "Min spend ₹2,999",
    expiry: "Exclusive Pass",
    badge: "VIP Members",
    borderClass: "border-rose-500/20 hover:border-rose-500/40",
    bgClass: "bg-rose-500/[0.03] dark:bg-rose-400/[0.05]",
    badgeClass: "bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20",
    accentClass: "text-rose-700 dark:text-rose-400",
    glowClass: "bg-rose-500/10",
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
  const [isHeroHovered, setIsHeroHovered] = useState(false)
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

  // ⏱️ Auto-play Hero Carousel every 5.5 seconds (Pauses smoothly on hover)
  useEffect(() => {
    if (isHeroHovered) return
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [isHeroHovered])

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
    <main className="space-y-8 sm:space-y-14 pb-28 sm:pb-20 overflow-hidden">
      {/* ========================================================================= */}
      {/* 🌟 1. CINEMATIC LUXURY HERO SHOWCASE WITH DYNAMIC AMBIENT LIGHTING */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-1 sm:mt-3">
        <div
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-zinc-950 text-white min-h-[500px] sm:min-h-[540px] lg:h-[600px] flex flex-col justify-between p-5 sm:p-10 lg:p-12 select-none shadow-2xl border border-white/10 group/hero"
        >
          {/* Dynamic Ambient Glow Orb (Behind Typography) */}
          <div
            className={`absolute -top-16 -left-16 w-80 sm:w-[500px] h-80 sm:h-[500px] rounded-full blur-[100px] pointer-events-none transition-all duration-700 ${currentSlide.accentGlow}`}
          />

          {/* Background Image Carousel with Smooth Ken-Burns Fade */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 z-0"
            >
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                width="900"
                height="600"
                fetchPriority={currentHeroIndex === 0 ? "high" : "auto"}
                loading={currentHeroIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
              {/* Vibrant Slide-Specific Color Scrim */}
              <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.gradient}`} />
              {/* Soft Directional Contrast Gradients for Editorial Typography */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent sm:w-2/3" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Top Row: Floating Kicker / Badges & Sleek Slide Controls */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <motion.div
              key={`badge-${currentSlide.id}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap items-center gap-2 sm:gap-2.5"
            >
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${currentSlide.accentBg} text-zinc-950 text-xs font-black uppercase tracking-wider shadow-md`}>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                {currentSlide.discountBadge}
              </span>

              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 text-white text-[11px] font-mono font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                {currentSlide.kicker}
              </span>
            </motion.div>

            {/* Quick Arrow Controllers with Counter */}
            <div className="hidden sm:flex items-center gap-1.5 bg-black/45 backdrop-blur-xl p-1 rounded-full border border-white/15 shadow-xl">
              <button
                type="button"
                onClick={() =>
                  setCurrentHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
                }
                aria-label="Previous hero slide"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full hover:bg-white/20 flex items-center justify-center text-white transition active:scale-90 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1 px-2">
                <span className="text-xs font-mono font-bold text-white">0{currentHeroIndex + 1}</span>
                <span className="text-[10px] font-mono text-white/40">/</span>
                <span className="text-xs font-mono text-white/60">0{heroSlides.length}</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length)
                }
                aria-label="Next hero slide"
                className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full hover:bg-white/20 flex items-center justify-center text-white transition active:scale-90 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Middle Content Container: Editorial Streetwear Typography */}
          <div className="relative z-10 max-w-2xl space-y-3.5 sm:space-y-4 my-auto py-4">
            <motion.p
              key={`tag-${currentSlide.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`text-xs sm:text-sm font-mono font-extrabold uppercase tracking-widest ${currentSlide.accentColor}`}
            >
              {currentSlide.tag}
            </motion.p>

            {/* Title */}
            <motion.h1
              key={`title-${currentSlide.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-[52px] font-black tracking-tight leading-[1.08] text-white drop-shadow-lg"
            >
              {currentSlide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              key={`desc-${currentSlide.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.14 }}
              className="text-xs sm:text-sm md:text-base text-zinc-200 leading-relaxed font-normal line-clamp-2 max-w-xl drop-shadow-sm"
            >
              {currentSlide.description}
            </motion.p>

            {/* Action Row & One-Click Interactive Coupon Pill */}
            <motion.div
              key={`actions-${currentSlide.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="flex flex-wrap items-center gap-3 pt-2 sm:pt-3"
            >
              {/* High-Impact Primary CTA */}
              <Button
                size="lg"
                onClick={() => navigate(currentSlide.buttonLink)}
                className="group rounded-full px-6 sm:px-8 font-black shadow-2xl bg-white hover:bg-zinc-100 text-zinc-950 flex items-center gap-2.5 h-11 sm:h-12 text-xs sm:text-sm transition-all duration-300 transform hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-zinc-950" />
                <span>{currentSlide.buttonText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </Button>

              {/* Interactive One-Click Coupon Pill (Light Shade Aesthetic) */}
              <button
                type="button"
                onClick={() => handleCopyCode(currentSlide.offerCode)}
                aria-label={`Copy coupon code ${currentSlide.offerCode}`}
                className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/95 hover:bg-white text-zinc-950 shadow-xl border border-white/60 transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <div className={`p-1 rounded-full transition-colors ${copiedCode === currentSlide.offerCode ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-800"}`}>
                  {copiedCode === currentSlide.offerCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-950" />
                  )}
                </div>
                <span className="flex items-center gap-1.5 font-mono">
                  <span className="text-zinc-500 font-semibold text-[11px] sm:text-xs">CODE:</span>
                  <strong className="text-zinc-950 font-black tracking-wider">
                    {currentSlide.offerCode}
                  </strong>
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-300" />
                <span className={`text-[11px] font-bold tracking-wide uppercase transition-colors ${copiedCode === currentSlide.offerCode ? "text-emerald-700" : "text-zinc-600"}`}>
                  {copiedCode === currentSlide.offerCode ? "Copied!" : "Tap to Copy"}
                </span>
              </button>
            </motion.div>
          </div>

          {/* Bottom Row: Sleek Luxury Glass Slide Indicators */}
          <div className="relative z-10 w-full pt-4">
            {/* Desktop Slide Tabs (5 High-End Glass Cards) */}
            <div className="hidden sm:grid sm:grid-cols-5 gap-3">
              {heroSlides.map((slide, i) => {
                const isActive = currentHeroIndex === i

                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentHeroIndex(i)}
                    className={`group text-left p-3 rounded-2xl backdrop-blur-xl transition-all duration-300 relative border flex flex-col justify-between overflow-hidden cursor-pointer ${
                      isActive
                        ? `bg-black/65 ${slide.accentBorder} ring-1 ring-white/25 shadow-xl scale-[1.02]`
                        : "bg-black/30 hover:bg-black/50 border-white/10 hover:border-white/25 opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* Animated Progress Bar */}
                    <div className="h-1 w-full bg-white/15 rounded-full overflow-hidden mb-2">
                      {isActive ? (
                        <motion.div
                          key={`bar-${currentHeroIndex}-${isHeroHovered}`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: isHeroHovered ? 999999 : 5.5,
                            ease: "linear",
                          }}
                          className={`h-full ${slide.accentBg} rounded-full`}
                        />
                      ) : (
                        <div className="h-full w-0" />
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-[10px] font-mono font-black ${
                          isActive ? slide.accentColor : "text-white/50"
                        }`}
                      >
                        0{i + 1}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/90">
                        {slide.discountTag}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white truncate mt-1">
                      {slide.shortTitle}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* Mobile Controller (< sm) */}
            <div className="block sm:hidden space-y-2.5">
              <div className="grid grid-cols-5 gap-1.5">
                {heroSlides.map((slide, i) => {
                  const isActive = currentHeroIndex === i

                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setCurrentHeroIndex(i)}
                      className="py-3.5 px-0.5 min-h-[44px] flex items-center justify-center focus:outline-none cursor-pointer"
                      aria-label={`Go to slide ${i + 1}: ${slide.shortTitle}`}
                    >
                      <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                        {isActive ? (
                          <motion.div
                            key={`bar-mobile-${currentHeroIndex}`}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5.5, ease: "linear" }}
                            className={`h-full ${slide.accentBg} rounded-full`}
                          />
                        ) : (
                          <div
                            className={`h-full ${
                              i < currentHeroIndex ? "bg-white/50" : "w-0"
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between bg-black/50 backdrop-blur-xl border border-white/20 px-3.5 py-2 rounded-xl text-xs shadow-lg">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-[11px] font-bold text-white/60">
                    0{currentHeroIndex + 1}
                  </span>
                  <span className="font-extrabold text-white truncate">
                    {currentSlide.shortTitle}
                  </span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${currentSlide.accentBg} text-zinc-950 shrink-0`}>
                  {currentSlide.discountTag}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🚀 2. VALUE PROPOSITIONS STRIP */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-border/70 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3.5 p-1.5 sm:p-2">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs sm:text-sm text-foreground leading-snug">Express Delivery</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Fast dispatch with live AWB tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5 p-1.5 sm:p-2">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-green-500/10 text-green-600 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs sm:text-sm text-foreground leading-snug">100% Genuine</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Authentic, verified quality apparel</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5 p-1.5 sm:p-2">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 shrink-0">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs sm:text-sm text-foreground leading-snug">7-Day Returns</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Hassle-free exchange policy</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5 p-1.5 sm:p-2">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 shrink-0">
              <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs sm:text-sm text-foreground leading-snug">24/7 AI Support</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Instant smart order lookup</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ⏱️ 3. LIVE FLASH DEALS TICKING COUNTDOWN BANNER (SUBTLE LUXURY EDITION) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-card/80 dark:bg-zinc-900/70 border border-border/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 backdrop-blur-md">
          {/* Subtle soft ambient aura */}
          <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <div className="space-y-1.5 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-primary" /> Limited Time Flash Offer
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
              Extra 10% Off Instant Sitewide
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
              <span>Use voucher code</span>
              <button
                type="button"
                onClick={() => handleCopyCode("SHOPSHERE10")}
                aria-label="Copy SHOPSHERE10 coupon code"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-mono font-bold text-xs border border-border transition active:scale-95 cursor-pointer"
              >
                <span>SHOPSHERE10</span>
                {copiedCode === "SHOPSHERE10" ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
              <span>at checkout before time expires.</span>
            </p>
          </div>

          {/* Minimalist Monochrome Countdown Timer Display */}
          <div className="flex items-center gap-2 sm:gap-3 relative z-10">
            <div className="flex flex-col items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-muted/60 dark:bg-zinc-800/80 border border-border/70 shadow-2xs">
              <span className="text-sm sm:text-lg font-black font-mono leading-none text-foreground">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[8px] uppercase font-bold text-muted-foreground mt-0.5 tracking-wider">Hours</span>
            </div>
            <span className="text-base sm:text-lg font-black font-mono text-muted-foreground/60">:</span>
            <div className="flex flex-col items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-muted/60 dark:bg-zinc-800/80 border border-border/70 shadow-2xs">
              <span className="text-sm sm:text-lg font-black font-mono leading-none text-foreground">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[8px] uppercase font-bold text-muted-foreground mt-0.5 tracking-wider">Mins</span>
            </div>
            <span className="text-base sm:text-lg font-black font-mono text-muted-foreground/60">:</span>
            <div className="flex flex-col items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-muted/60 dark:bg-zinc-800/80 border border-border/70 shadow-2xs">
              <span className="text-sm sm:text-lg font-black font-mono leading-none text-primary">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[8px] uppercase font-bold text-muted-foreground mt-0.5 tracking-wider">Secs</span>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto">
            <Button
              size="lg"
              onClick={() => navigate("/products")}
              className="rounded-full px-6 sm:px-8 font-black shadow-xs text-xs sm:text-sm h-11 w-full md:w-auto bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Explore Deals</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
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
                width="240"
                height="288"
                loading="lazy"
                decoding="async"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-1">
          {promoVouchers.map((voucher) => {
            const isCopied = copiedCode === voucher.code

            return (
              <div
                key={voucher.code}
                className={`group relative overflow-hidden rounded-3xl p-4 sm:p-5 ${voucher.bgClass} ${voucher.borderClass} border shadow-xs hover:shadow-md flex flex-col justify-between space-y-3.5 transition-all duration-300 hover:-translate-y-0.5`}
              >
                {/* Subtle light ambient glow */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity ${voucher.glowClass}`}
                />

                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${voucher.badgeClass}`}>
                      {voucher.badge}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                      {voucher.expiry}
                    </span>
                  </div>

                  <div className="pt-0.5">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground block">
                      {voucher.discount}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-foreground/90 mt-0.5 line-clamp-1">
                      {voucher.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {voucher.minSpend}
                    </p>
                  </div>
                </div>

                {/* Perforated coupon divider */}
                <div className="relative z-10 -mx-5 px-5 border-t border-dashed border-border/80" />

                {/* Clean Light Code Pill & Copy Action */}
                <div className="relative z-10 flex justify-between items-center bg-card/90 dark:bg-zinc-900/90 border border-border/70 rounded-2xl p-2 sm:p-2.5 shadow-2xs">
                  <span className={`font-mono font-black text-xs sm:text-sm tracking-wider pl-1 ${voucher.accentClass}`}>
                    {voucher.code}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(voucher.code)}
                    aria-label={`Copy coupon code ${voucher.code}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all duration-200 active:scale-95 cursor-pointer shadow-xs ${
                      isCopied
                        ? "bg-emerald-500 text-white"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied!
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
          <ProductHorizontalTrackSkeleton count={5} />
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
            <h2 className="text-xl sm:text-4xl font-black tracking-tight text-white">
              Unlock ₹200 Off Your First Order
            </h2>
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
                    aria-label="Email address for VIP membership discounts"
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  aria-label="Unlock voucher code"
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
                  <h3 className="font-extrabold text-foreground">{review.name}</h3>
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
