// src/components/common/Loader.tsx
interface LoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function Loader({ size = "md", className = "" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-14 h-14 border-4",
  }

  return (
    <div
      role="status"
      aria-label="Loading content"
      className={`flex justify-center items-center py-8 ${className}`}
    >
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-primary/20 animate-pulse`}
        />
        <div
          className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin`}
        />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
