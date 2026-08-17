import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Product } from "@/types/product"
import type { RootState } from "../store"

interface WishlistState {
  items: Product[]
}

const loadWishlistFromStorage = (): Product[] => {
  try {
    const saved = localStorage.getItem("shopshere_wishlist")
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const initialState: WishlistState = {
  items: loadWishlistFromStorage(),
}

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const exists = state.items.find((item) => item._id === action.payload._id)
      if (exists) {
        state.items = state.items.filter((item) => item._id !== action.payload._id)
      } else {
        state.items.push(action.payload)
      }
      try {
        localStorage.setItem("shopshere_wishlist", JSON.stringify(state.items))
      } catch (e) {
        console.error("Failed to save wishlist to storage", e)
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload)
      try {
        localStorage.setItem("shopshere_wishlist", JSON.stringify(state.items))
      } catch (e) {
        console.error("Failed to save wishlist to storage", e)
      }
    },
    clearWishlist: (state) => {
      state.items = []
      try {
        localStorage.removeItem("shopshere_wishlist")
      } catch (e) {
        console.error("Failed to clear wishlist storage", e)
      }
    },
  },
})

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions

export const selectWishlistItems = (state: RootState) => state.wishlist?.items || []
export const selectIsInWishlist = (id: string) => (state: RootState) =>
  state.wishlist?.items.some((item) => item._id === id)

export default wishlistSlice.reducer
