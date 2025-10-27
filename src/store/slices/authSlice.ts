import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Tokens {
  accessToken?: string
  expiresIn?: string
  refreshExpiresIn?: string
  refreshToken?: string
}

interface AuthState {
  tokens: Tokens | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  tokens: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    // Login user
    login: (state, action: PayloadAction<Tokens>) => {
      state.tokens = action.payload
      state.isAuthenticated = true
      state.error = null
      state.loading = false
    },

    // Logout user
    logout: state => {
      state.tokens = null
      state.isAuthenticated = false
      state.error = null
      state.loading = false
    },

    // Update user data
    updateUser: (state, action: PayloadAction<Partial<Tokens>>) => {
      if (state.tokens) {
        state.tokens = { ...state.tokens, ...action.payload }
      }
    },

    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },

    // Clear error
    clearError: state => {
      state.error = null
    },

    // Refresh tokens
    refreshTokens: (state, action: PayloadAction<Tokens>) => {
      state.tokens = action.payload
      state.isAuthenticated = true
      state.error = null
      state.loading = false
    },
  },
})

export const {
  setLoading,
  login,
  logout,
  updateUser,
  setError,
  clearError,
  refreshTokens,
} = authSlice.actions

export default authSlice.reducer
