import type { RootState } from '@/lib/store'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'


const initialState: ExcalidrawElement[] | [] = [];

export const excalidrawSlice = createSlice({
  name: 'excalidrawSlice',
  initialState,
  reducers: {
    // other -> store
    setStreamEl: (state, {payload}: PayloadAction<ExcalidrawElement>) => {
      console.log('리덕스_setStreamEl');
      const streamArr:ExcalidrawElement = state.find(({id}) => id === payload.id) as ExcalidrawElement
      return Boolean(streamArr) ? state.map(el => {
        if(el.id === streamArr.id) {
          return payload
        } return el
      }) : [...state, payload]
    }, 
    // own -> store
    setAddEl: (state, {payload}: PayloadAction<ExcalidrawElement>) => {
      console.log('리덕스_setAddEl')
      return [...state, payload]
    },
    // other -> store
    setAddOtherEl: (state, {payload}: PayloadAction<ExcalidrawElement>) => {
      console.log('리덕스_setAddOtherEl');
      const streamArr:ExcalidrawElement = state.find(({id}) => id === payload.id) as ExcalidrawElement
      return state.map(el => {
        if(el.id === streamArr.id) {
          return payload
        } return el
      })
      },
    // other || own -> store 
    setChange_Els: (state, {payload}: PayloadAction<ExcalidrawElement[]>) => {
      console.log('리덕스_setStreamEls');
      const findIds = payload.map(({id}) => id)
      return state.map(el => {
        if(findIds.includes(el.id)) {
          const findEl = payload.find(({id}) => id === el.id) as ExcalidrawElement
          return {...findEl}
        } return el
      })
    },  
    // remove && reset
    // other -> store 
     setRemove_Els: (state, {payload}: PayloadAction<string[]>) => {
      console.log('리덕스_setRemove_Els');
      const activeEls = [...state.filter(({id}) => !payload.includes(id))]
      return activeEls
    },
    // Recover other -> store 
    setRecoverOther_Els : (state) => {
      console.log('리덕스_setRecoverOther_Els');
      return [...state]
    },
  },
})

export const { 
    setStreamEl, 
    setAddOtherEl, 
    setAddEl,
    setChange_Els,
    setRecoverOther_Els,
    setRemove_Els,
  } = excalidrawSlice.actions 
export const selectExcalidrawElements = (state: RootState) => state.excalidrawSlice
export default excalidrawSlice.reducer