import { configureStore } from '@reduxjs/toolkit'
import excalidrawSlice from './modules/excalidrawSlice'
import excalidrawMovedSlice from './modules/excalidrawMovedSlice'
import excalidrawPointersSlice from './modules/excalidrawPointersSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      excalidrawSlice,
      excalidrawMovedSlice,
      excalidrawPointersSlice
    }
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']