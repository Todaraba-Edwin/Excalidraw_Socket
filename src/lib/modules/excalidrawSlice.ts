import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/store'
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
import type { PayloadAction } from '@reduxjs/toolkit'

const initialState: ExcalidrawElement[] = []

export const excalidrawSlice = createSlice({
  name: 'excalidrawSlice',
  initialState,
  reducers: {
      streamElements: (state, {payload}: PayloadAction<ExcalidrawElement>) => {
        const streamArr = state.find(({id}) => id === payload.id)
        console.log('리덕스_streamElements', payload, Boolean(streamArr), streamArr);
        return !Boolean(streamArr) ? [...state, payload] : state.map(el => {
          if(el.id === payload.id) {
            return {...payload}
          }
          return el
        })
    },
    addElements: (state, {payload}: PayloadAction<ExcalidrawElement>) => {
        console.log('리덕스_addElements');
        const streamArr = state.find(({id}) => id === payload.id)
        return !Boolean(streamArr) ? [...state, payload] : state
    },
    changeElments: (state,{payload}:PayloadAction<ExcalidrawElement[]>) => {
      console.log('리덕스_changeElments', payload);
      const changeElementsIds = payload.map(({id}) => id)
      return state.map(el => {
        if(changeElementsIds.includes(el.id)) {
          const findElement = payload.find(({id}) => id === el.id)
          console.log('findElement', findElement);
          return {...el, 
              x: findElement? findElement.x: el.x, 
              y: findElement? findElement.y: el.y, 
              strokeColor: findElement? findElement.strokeColor: el.strokeColor
            }
        } return el        
      })
    },
    removeElements: (state, {payload}:PayloadAction<string[]>) => {
      console.log('리덕스_removeElements');
      return [...state.filter(({id}) => !payload.includes(id))]
    },
    resetElements: ( ) => {
      console.log('리덕스_resetElements');
      return []
    }
  },
})

export const { streamElements, addElements, changeElments, removeElements, resetElements } = excalidrawSlice.actions
export const selectExcalidrawElements = (state: RootState) => state.excalidrawSlice
export default excalidrawSlice.reducer