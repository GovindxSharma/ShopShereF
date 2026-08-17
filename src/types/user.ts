export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "delivery" | "admin"
  provider: "local" | "google"
  phone?: string
  createdAt?: string
  updatedAt?: string
}