import type { RootState } from '@/lib/store'
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'


type initialStateType = {
  totalState : ExcalidrawElement[] | [],
  movedState : []
}

const initialState: initialStateType = {
  totalState : [],
  movedState : []
}
export const excalidrawSlice = createSlice({
  name: 'excalidrawSlice',
  initialState,
  reducers: {
    // other -> store
    setStreamEl: (state, {payload}: PayloadAction<ExcalidrawElement>) => {
      const streamArr:ExcalidrawElement = state.totalState.find(({id}) => id === payload.id) as ExcalidrawElement
      console.log('리덕스_setStreamEl');
      return Boolean(streamArr) ? {...state, totalState: state.totalState.map(el => {
        if(el.id === streamArr.id) {
          return payload
        } return el
      })} : {...state, totalState: [...state.totalState, payload]}
    }, 
    // other -> store
    setAddOtherEl: (state, {payload}: PayloadAction<ExcalidrawElement>) => {
      console.log('리덕스_setAddOtherEl');
      const streamArr:ExcalidrawElement = state.totalState.find(({id}) => id === payload.id) as ExcalidrawElement
      return {...state, totalState:state.totalState.map(el => {
        if(el.id === streamArr.id) {
          return payload
        } return el
      })}
    }, 
    // own -> store
    setAddEl: (state, {payload}: PayloadAction<ExcalidrawElement>) => {
      console.log('리덕스_setAddEl')
      return {...state, totalState:[...state.totalState, payload]}
    },
    // other -> store
    setStreamMove_Els: (state, {payload}: PayloadAction<ExcalidrawElement[]>) => {
      console.log('리덕스_setStreamEls');
      const findIds = payload.map(({id}) => id)
      return {...state, totalState:state.totalState.map(el => {
        if(findIds.includes(el.id)) {
          const findEl = payload.find(({id}) => id === el.id) as ExcalidrawElement
          return {...findEl}
        } return el
      })}
    }, 
    // moved_ownEls
    setMovedOwnEls : (state, {payload}: PayloadAction<ExcalidrawElement[]>) => {
      console.log('리덕스_setMovedOwnEls', payload ) // id 만 있어도 된다고 그치? 
      return {...state}
    }
  },
})

export const { setStreamEl, setAddOtherEl, setAddEl, setStreamMove_Els, setMovedOwnEls } = excalidrawSlice.actions
export const selectExcalidrawElements = (state: RootState) => state.excalidrawSlice
export default excalidrawSlice.reducer


  //   changeElments: (state,{payload}:PayloadAction<ExcalidrawElement[]>) => {
  //     // console.log('리덕스_changeElments');
  //     const changeElementsIds = payload.map(({id}) => id)
  //     return state.map(el => {
  //       if(changeElementsIds.includes(el.id)) {
  //         const findElement = payload.find(({id}) => id === el.id)
  //         return {...el, 
  //             x: findElement? findElement.x: el.x, 
  //             y: findElement? findElement.y: el.y, 
  //             strokeColor: findElement? findElement.strokeColor: el.strokeColor
  //           }
  //       } return el        
  //     })
  //   },
  //   removeElements: (state, {payload}:PayloadAction<string[]>) => {
  //     // console.log('리덕스_removeElements');
  //     return [...state.filter(({id}) => !payload.includes(id))]
  //   },
  //   resetElements: (_,{payload}:PayloadAction<ExcalidrawElement[]>) => {
  //     // console.log('리덕스_resetElements');
  //     return [...payload]
  //   }

/*
import type { RootState } from '@/lib/store';
import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

interface ExcalidrawSliceState extends Array<ExcalidrawElement> {}

const initialState: ExcalidrawSliceState = [];

interface SetElementActionPayload {
  payload: ExcalidrawElement;
}

type SetElementCaseReducer = CaseReducer<ExcalidrawSliceState, PayloadAction<SetElementActionPayload>>;

const setElements: SetElementCaseReducer = (state, { payload }) => {
  const streamArr: ExcalidrawElement | undefined = state.find(({ id }) => id === payload.id);
  console.log('리덕스_streamElements');

  return state
};

export const excalidrawSlice = createSlice({
  name: 'excalidrawSlice',
  initialState,
  reducers: {
    setElement:setElements,
    setStreamEl: setElements,
    setAddOtherEl: setElements,
    setAddEl: (state, { payload }: PayloadAction<ExcalidrawElement>) => {
      console.log('리덕스_streamElements');
      return [...state, payload];
    },
  },
});

export const { setElement, setStreamEl, setAddEl } = excalidrawSlice.actions;
export const selectExcalidrawElements = (state: RootState) => state.excalidrawSlice as ExcalidrawSliceState;
export default excalidrawSlice.reducer;
*/