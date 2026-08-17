// src/redux/slices/productSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Product } from "@/types/product"

interface ProductState {
  products: Product[]
  total: number
  loading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  total: 0,
  loading: false,
  error: null,
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (
    params: {
      page?: number
      limit?: number
      category?: string
      ratings?: number
      price?: number
      keyword?: string
      sort?: string
    } = {},
    thunkAPI
  ) => {
    try {
      const query = new URLSearchParams()
      if (params.page) query.append("page", params.page.toString())
      if (params.limit) query.append("limit", params.limit.toString())
      if (params.category && params.category !== "All") query.append("category", params.category)
      if (params.ratings && params.ratings > 0) query.append("ratings", params.ratings.toString())
      if (params.price && params.price > 0) query.append("price", params.price.toString())
      if (params.keyword && params.keyword.trim() !== "") query.append("search", params.keyword.trim())
      if (params.sort) query.append("sort", params.sort)

      const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`, {
        credentials: "include",
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch products")
      return { products: data.products || [], total: data.total || 0 }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products"
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<{ products: Product[]; total: number }>) => {
          state.loading = false
          state.products = action.payload.products
          state.total = action.payload.total
        }
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default productSlice.reducer
