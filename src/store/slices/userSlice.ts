import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TimezoneId {
  _id: string
  value: string
  name: string
}

interface Permission {
  _id: string
  moduleCode: string
  key: string
  description: string
  createdAt: string
  updatedAt: string
}

interface Module {
  _id: string
  name: string
  isP1Module: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  code: string
  permissions: Permission[]
}

interface UserData {
  _id: string
  name: string
  type: string
  username: string
  passwordHash: string
  timezoneId: TimezoneId
  tenantId?: string | null
  createdAt: string
  updatedAt: string
  permissions: Permission[]
  modules: Module[]
}

interface UserState {
  data: UserData | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  data: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    // Set user data
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.data = action.payload
      state.error = null
      state.loading = false
    },

    // Update user data
    updateUserData: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload }
      }
    },

    // Clear user data
    clearUserData: state => {
      state.data = null
      state.error = null
      state.loading = false
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
  },
})

export const {
  setLoading,
  setUserData,
  updateUserData,
  clearUserData,
  setError,
  clearError,
} = userSlice.actions

export default userSlice.reducer
