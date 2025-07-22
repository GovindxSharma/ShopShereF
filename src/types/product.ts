import type { User } from "./user"

export interface Image {
  public_id: string
  url: string
}

export interface Review {
  user: string | User
  name: string
  rating: number
  comment: string
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  ratings: number
  images: Image[]
  category: string
  stock: number
  numOfReviews: number
  reviews: Review[]
  user: string | User
  createdAt: string
  updatedAt?: string
}
