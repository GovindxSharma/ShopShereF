import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

const API_BASE = import.meta.env.VITE_API_BASE_URL

interface User {
  _id: string
  name: string
  email: string
  role: "user" | "admin"
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

// 🧠 Login thunk
export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Login failed")
      return data.user as User
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something Went Wrong"
      return thunkAPI.rejectWithValue(errorMessage)
    }
    
  }
)

// ✳️ Logout thunk
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    clearUser(state) {
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer
