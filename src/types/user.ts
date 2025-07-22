export interface User {
    _id: string
    name: string
    email: string
    avatar?: string
    role: "user" | "admin"
    provider: "local" | "google"
    createdAt?: string
    updatedAt?: string
  }
  