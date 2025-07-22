import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import productReducer from "./slices/productSlice"
import cartReducer from "./slices/cartSlice"
import reviewReducer from "./slices/reviewSlice"
import orderReducer from "./slices/orderSlice" // ✅ if using orderSlice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    review: reviewReducer,
    order: orderReducer, // ✅ optional: include if you've added it
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
