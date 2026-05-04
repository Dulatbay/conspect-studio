import { configureStore } from '@reduxjs/toolkit'
import { conspectApi } from '../services/conspect/api'

export const store = configureStore({
  reducer: {
    [conspectApi.reducerPath]: conspectApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(conspectApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
