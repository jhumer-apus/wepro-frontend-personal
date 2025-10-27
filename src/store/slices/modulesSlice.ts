import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ModulePermission {
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
  permissions: ModulePermission[]
}

interface ModulesState {
  data: Module[]
  loading: boolean
  error: string | null
  lastFetched: number | null
}

const initialState: ModulesState = {
  data: [],
  loading: false,
  error: null,
  lastFetched: null,
}

const modulesSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    // Set modules data
    setModules: (state, action: PayloadAction<Module[]>) => {
      state.data = action.payload
      state.error = null
      state.loading = false
      state.lastFetched = Date.now()
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

    // Clear modules data
    clearModules: state => {
      state.data = []
      state.error = null
      state.loading = false
      state.lastFetched = null
    },

    // Force refresh - clear cache to force new API call
    forceRefresh: state => {
      state.lastFetched = null
    },
  },
})

export const {
  setLoading,
  setModules,
  setError,
  clearError,
  clearModules,
  forceRefresh,
} = modulesSlice.actions

export default modulesSlice.reducer
