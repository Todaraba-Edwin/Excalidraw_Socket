import type { RootState } from '@/lib/store'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type UserPonterType = {
  x:number,
  y:number,
  writerId : string,
  color?:string
}

const initialState: UserPonterType[] = [];

export const excalidrawPointersSlice = createSlice({
  name: 'excalidrawPointersSlice',
  initialState,
  reducers: {
    setPointer : (state, {payload}: PayloadAction<UserPonterType>) => {
      function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }
      const findWriterId = state.find(({writerId}) => payload.writerId === writerId)
      const currentList = Boolean(findWriterId) ? [...state.map(id => {
        return id.writerId === payload.writerId ? {...id, x:payload.x, y:payload.y} : id
      })] : [...state, {...payload, color:getRandomColor()}]
      return currentList
    }
  },
})

export const { setPointer } = excalidrawPointersSlice.actions
export const selectExcalidrawPointers = (state: RootState) => state.excalidrawPointersSlice
export default excalidrawPointersSlice.reducer

