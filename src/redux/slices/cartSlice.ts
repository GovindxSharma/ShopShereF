// src/redux/slices/cartSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"

const API_BASE = import.meta.env.VITE_API_BASE_URL

export interface Product {
  image: any
  _id: string
  name: string
  price: number
  images: { url: string }[]
}

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  loading: boolean
  error: string | null
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchCart = createAsyncThunk("cart/fetch", async (_, thunkAPI) => {
  try {
    const res = await fetch(`${API_BASE}/cart`, { credentials: "include" })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to fetch cart")
    return data.items as CartItem[]
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Somethings Went Wrong"
    return thunkAPI.rejectWithValue(errorMessage)
  }
  
})

export const addToCart = createAsyncThunk("cart/add", async (product: Product, thunkAPI) => {
  try {
    const res = await fetch(`${API_BASE}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product: product._id, quantity: 1 }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to add to cart")
    return data.items as CartItem[]
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Somethings Went Wrong"
    return thunkAPI.rejectWithValue(errorMessage)
  }
})

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async ({ id, quantity }: { id: string; quantity: number }, thunkAPI) => {
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ product: id, quantity }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update item")
      return data.items as CartItem[]
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Somethings Went Wrong"
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

export const removeFromCart = createAsyncThunk("cart/remove", async (id: string, thunkAPI) => {
  try {
    const res = await fetch(`${API_BASE}/cart`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product: id }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Failed to remove item")
    return data.items as CartItem[]
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Somethings Went Wrong"
    return thunkAPI.rejectWithValue(errorMessage)
  }
})

export const clearCart = createAsyncThunk("cart/clear", async (_, thunkAPI) => {
  try {
    const res = await fetch(`${API_BASE}/cart/clear`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!res.ok) throw new Error("Failed to clear cart")
    return []
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Somethings Went Wrong"
    return thunkAPI.rejectWithValue(errorMessage)
  }
})

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.items = action.payload
      })
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.items = action.payload
      })
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.items = action.payload
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
      })
  },
})

export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectCart = (state: RootState) => state.cart

export default cartSlice.reducer
