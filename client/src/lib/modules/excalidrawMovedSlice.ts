import type { RootState } from '@/lib/store'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'


const initialState: string[] = [];

export const excalidrawMovedSlice = createSlice({
  name: 'excalidrawMovedSlice',
  initialState,
  reducers: {
    setMovedEls: (_, {payload}: PayloadAction<string[]> ) => {
      console.log('excalidrawMovedSlice_setMovedEls', payload);
      return [...payload]
    }
  },
})

export const { setMovedEls } = excalidrawMovedSlice.actions
export const selectExcalidrawMovedEls = (state: RootState) => state.excalidrawMovedSlice
export default excalidrawMovedSlice.reducer

