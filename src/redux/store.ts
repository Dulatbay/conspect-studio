import { configureStore } from '@reduxjs/toolkit'
import { conspectApi } from '../services/conspect/api'
import { moduleApi } from '../services/module/api'

export const store = configureStore({
  reducer: {
    [conspectApi.reducerPath]: conspectApi.reducer,
    [moduleApi.reducerPath]: moduleApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(conspectApi.middleware)
      .concat(moduleApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
