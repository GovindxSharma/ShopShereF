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

// 2️⃣ Create App Order (Razorpay)
export const createAppOrder = createAsyncThunk(
  "order/createAppOrder",
  async (
    {
      items,
      shippingAddress,
      totalAmount,
      discountAmount = 0,
      couponCode = "",
      razorpayOrderId,
    }: {
      items: OrderItem[]
      shippingAddress: ShippingAddress
      totalAmount: number
      discountAmount?: number
      couponCode?: string
      razorpayOrderId: string
    },
    thunkAPI
  ) => {
    try {
      return await fetchWithJson("/orders", {
        method: "POST",
        body: JSON.stringify({
          items,
          shippingAddress,
          totalAmount,
          discountAmount,
          couponCode,
          razorpayOrderId,
        }),
      })
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Order creation failed"
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

// ⚡ Create Demo / COD Order (Instant Test Checkout)
export const createDemoOrder = createAsyncThunk(
  "order/createDemoOrder",
  async (
    {
      items,
      shippingAddress,
      totalAmount,
      discountAmount = 0,
      couponCode = "",
      paymentMethod = "demo",
    }: {
      items: OrderItem[]
      shippingAddress: ShippingAddress
      totalAmount: number
      discountAmount?: number
      couponCode?: string
      paymentMethod?: "demo" | "cod"
    },
    thunkAPI
  ) => {
    try {
      return await fetchWithJson("/orders/demo", {
        method: "POST",
        body: JSON.stringify({
          items,
          shippingAddress,
          totalAmount,
          discountAmount,
          couponCode,
          paymentMethod,
        }),
      })
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Demo order failed"
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
        err instanceof Error ? err.message : "Payment verification failed"
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
        err instanceof Error ? err.message : "Failed to fetch orders"
      return thunkAPI.rejectWithValue(errorMessage)
    }
  }
)

// 5️⃣ Cancel Order (User)
export const cancelUserOrder = createAsyncThunk<Order, string, { rejectValue: string }>(
  "order/cancelUserOrder",
  async (orderId: string, thunkAPI) => {
    try {
      const res = await fetchWithJson(`/orders/${orderId}/cancel`, {
        method: "PUT",
      })
      return res.order
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel order"
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
      // Create App Order
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

      // Create Demo Order
      .addCase(createDemoOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDemoOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false
        state.currentOrder = action.payload
      })
      .addCase(createDemoOrder.rejected, (state, action) => {
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

      // Cancel Order
      .addCase(cancelUserOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.userOrders = state.userOrders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        )
      })

      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false
        if (state.currentOrder) {
          state.currentOrder = {
            ...state.currentOrder,
            ...action.payload,
            paymentStatus: "paid",
            orderStatus: "processing",
          }
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default orderSlice.reducer
