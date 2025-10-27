import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import modulesReducer from './slices/modulesSlice'

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  modules: modulesReducer,
})

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user', 'modules'], // Add modules to persisted data
}

// Create persisted root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Redux Persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
