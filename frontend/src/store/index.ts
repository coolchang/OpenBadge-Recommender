import { configureStore } from '@reduxjs/toolkit'
import badgeReducer from './slices/badgeSlice'
import userReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    badges: badgeReducer,
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 