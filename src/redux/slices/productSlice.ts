// src/redux/slices/productSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Product } from "@/types/product"

export interface FetchProductsParams {
  page?: number
  limit?: number
  category?: string
  ratings?: number
  price?: number
  keyword?: string
  sort?: string
  forceRefresh?: boolean
}

interface CacheEntry {
  products: Product[]
  total: number
  timestamp: number
}

interface ProductState {
  products: Product[]
  total: number
  loading: boolean
  error: string | null
  cache: Record<string, CacheEntry>
}

const initialState: ProductState = {
  products: [],
  total: 0,
  loading: false,
  error: null,
  cache: {},
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const serializeQuery = (params: FetchProductsParams = {}): string => {
  return JSON.stringify({
    page: params.page || 1,
    limit: params.limit || 8,
    category: params.category || "",
    ratings: params.ratings || 0,
    price: params.price || 0,
    keyword: (params.keyword || "").trim(),
    sort: params.sort || "",
  })
}

// ⚡ Smart Async Thunk with 3-Minute Query Cache
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params: FetchProductsParams = {}, thunkAPI) => {
    const queryKey = serializeQuery(params)
    const state = thunkAPI.getState() as { products: ProductState }

    // Check if cache exists & is still fresh (< 3 minutes)
    if (!params.forceRefresh && state.products?.cache?.[queryKey]) {
      const cached = state.products.cache[queryKey]
      const CACHE_TTL = 180000 // 3 minutes
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return {
          products: cached.products,
          total: cached.total,
          fromCache: true,
          queryKey,
        }
      }
    }

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

      return {
        products: data.products || [],
        total: data.total || 0,
        fromCache: false,
        queryKey,
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products"
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    invalidateProductCache: (state) => {
      state.cache = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        const queryKey = serializeQuery(action.meta.arg)
        const cached = state.cache[queryKey]
        if (cached && Date.now() - cached.timestamp < 180000) {
          // Serve from cache instantly without full-screen loading spinner
          state.products = cached.products
          state.total = cached.total
          state.loading = false
        } else {
          state.loading = true
        }
        state.error = null
      })
      .addCase(
        fetchProducts.fulfilled,
        (
          state,
          action: PayloadAction<{
            products: Product[]
            total: number
            fromCache: boolean
            queryKey: string
          }>
        ) => {
          state.loading = false
          state.products = action.payload.products
          state.total = action.payload.total

          if (!action.payload.fromCache && action.payload.queryKey) {
            state.cache[action.payload.queryKey] = {
              products: action.payload.products,
              total: action.payload.total,
              timestamp: Date.now(),
            }
          }
        }
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { invalidateProductCache } = productSlice.actions
export default productSlice.reducer

