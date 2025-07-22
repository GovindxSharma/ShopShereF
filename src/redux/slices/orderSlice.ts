// src/redux/slices/orderSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { Order, OrderItem, ShippingAddress } from "@/types/order"

const API_BASE = import.meta.env.VITE_API_BASE_URL

const fetchWithJson = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "Request failed")
  }

  return res.json()
}

// 1️⃣ Create Razorpay Order
export const createRazorpayOrder = createAsyncThunk(
  "order/createRazorpayOrder",
  async (amount: number) => {
    return await fetchWithJson("/payment/razorpay", {
      method: "POST",
      body: JSON.stringify({ amount }),
    })
  }
)

// 2️⃣ Create App Order after payment
export const createAppOrder = createAsyncThunk(
  "order/createAppOrder",
  async (
    {
      items,
      shippingAddress,
      totalAmount,
      razorpayOrderId,
    }: {
      items: OrderItem[]
      shippingAddress: ShippingAddress
      totalAmount: number
      razorpayOrderId: string
    },
    thunkAPI
  ) => {
    try {
      return await fetchWithJson("/orders", {
        method: "POST",
        body: JSON.stringify({ items, shippingAddress, totalAmount, razorpayOrderId }),
      })
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Order creation failed"
      return thunkAPI.rejectWithValue(errorMessage)
    }
    
  }
)

// 3️⃣ Verify Razorpay Payment
export const verifyPayment = createAsyncThunk(
  "order/verifyPayment",
  async (
    {
      orderId,
      payment,
    }: {
      orderId: string
      payment: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }
    },
    thunkAPI
  ) => {
    try {
      return await fetchWithJson("/orders/verify", {
        method: "POST",
        body: JSON.stringify({ orderId, ...payment }),
      })
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Pyment verification failed"
      return thunkAPI.rejectWithValue(errorMessage)
    }
    
  }
)

// 4️⃣ Fetch User Orders
export const fetchUserOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  "order/fetchUserOrders",
  async (_, thunkAPI) => {
    try {
      return await fetchWithJson("/orders/mine")
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to Fetch Orders"
      return thunkAPI.rejectWithValue(errorMessage)
    }
    
  }
)

// 🧾 Slice State
interface OrderState {
  loading: boolean
  error: string | null
  currentOrder: Order | null
  userOrders: Order[]
}

const initialState: OrderState = {
  loading: false,
  error: null,
  currentOrder: null,
  userOrders: [],
}

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Create Order
      .addCase(createAppOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAppOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(createAppOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch User Orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false
        state.userOrders = action.payload
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = {
          ...state.currentOrder!,
          ...action.payload,
          paymentStatus: "paid",
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default orderSlice.reducer
