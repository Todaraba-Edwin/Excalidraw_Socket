import { configureStore } from '@reduxjs/toolkit'
import excalidrawSlice from './modules/excalidrawSlice'
import excalidrawMovedSlice from './modules/excalidrawMovedSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      excalidrawSlice,
      excalidrawMovedSlice
    }
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']