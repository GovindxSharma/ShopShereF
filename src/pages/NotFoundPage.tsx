import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Home, ArrowLeft } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="space-y-6 max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-2 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            404 — Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Lost in the Store?
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page or product you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button size="lg" className="rounded-full px-6 font-bold flex items-center gap-2 shadow-md">
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </Link>

          <Link to="/products">
            <Button size="lg" variant="outline" className="rounded-full px-6 font-bold flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
