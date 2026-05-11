import { configureStore } from '@reduxjs/toolkit'
import campaignReducer from './slices/campaignSlice'
import contactReducer  from './slices/contactSlice'
import analyticsReducer from './slices/analyticsSlice'
import uploadReducer   from './slices/uploadSlice'
import socketReducer   from './slices/socketSlice'

export const store = configureStore({
  reducer: {
    campaigns: campaignReducer,
    contacts:  contactReducer,
    analytics: analyticsReducer,
    uploads:   uploadReducer,
    socket:    socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})
