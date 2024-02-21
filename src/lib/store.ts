import { configureStore } from '@reduxjs/toolkit'
import excalidrawSlice from './modules/excalidrawSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      excalidrawSlice
    }
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']