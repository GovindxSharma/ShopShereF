// src/redux/slices/reviewSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import type { Review } from "@/types/review" // ✅ Import shared Review type



interface ReviewState {
  reviews: Review[]
  loading: boolean
  error: string | null
  success: boolean
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null,
  success: false,
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ⭐ Create or update a review
export const submitReview = createAsyncThunk(
  "review/submit",
  async (
    { productId, rating, comment }: { productId: string; rating: number; comment: string },
    thunkAPI
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating, comment, productId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to submit review")
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong"
      return thunkAPI.rejectWithValue(errorMessage)
    }
    
  }
)

// 🗑 Delete review (user only)
export const deleteReview = createAsyncThunk(
  "review/delete",
  async (productId: string, thunkAPI) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to delete review")
      return data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong"
      return thunkAPI.rejectWithValue(errorMessage)
    }
    
  }
)

// 📥 Fetch all reviews for a product
export const fetchReviews = createAsyncThunk(
  "review/fetch",
  async (productId: string, thunkAPI) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${productId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to load reviews")
      return data.reviews as Review[]
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong"
      return thunkAPI.rejectWithValue(errorMessage)
    }
    
  }
)

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    resetReviewSuccess(state) {
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      .addCase(deleteReview.fulfilled, (state) => {
        state.success = true
      })

      .addCase(fetchReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReviews.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.loading = false
        state.reviews = action.payload
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { resetReviewSuccess } = reviewSlice.actions
export default reviewSlice.reducer
export const selectReviews = (state: RootState) => state.review
