"use client";
import React from 'react'
import { useSearchParams } from 'next/navigation';
// style
import './drawbody.css'
// hooks
import { useSocket } from './useSocket';
import { pointerStateEnm, useExcalidraw } from './useExcalidraw';
// Redux
import { useAppSelector } from '@/lib/hooks';
import { selectExcalidrawElements } from '@/lib/modules/excalidrawSlice';
// lib
import { Excalidraw } from "@excalidraw/excalidraw";
import * as ExcalidrawTypes from '@excalidraw/excalidraw/types/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import cloneDeep from 'lodash/cloneDeep'


const ExcalidrawWrapper: React.FC = () => {
  const room_Name = 'roomName'
  const getUserId = useSearchParams().get('userId') || ''
  const totalState = useAppSelector(selectExcalidrawElements)
  const StoreElsLeng = totalState.length || 0;

  const {socketAPI} = useSocket({room_Name})
  const {
    excalidrawRef, 
    handleChangePointerState, 
    handleHideContextMenu,
    handleCurrentItemRoundness,
    handleCurrentItemRoughness,
    handleStreaming_addEl,
    // handleStreaming_MoveEls,
    // handleStreaming_MoveOtherReset,
    // handleChange_StrokeColorEls,
    // handle_Remove
  } = useExcalidraw(getUserId, room_Name, socketAPI)

  const onExcalidrawAPI = (api: ExcalidrawTypes.ExcalidrawImperativeAPI) => excalidrawRef.current = api;
  const onPointerUpdate = ({button}:{ button: pointerStateType}) => handleChangePointerState(button)
  const onChange = (excalidrawElements:readonly ExcalidrawElement[], appState: ExcalidrawTypes.AppState) => {    
    const activeEls = excalidrawElements.filter(({isDeleted}) => !isDeleted)
    const activeElsLeng = activeEls.length || 0

    handleHideContextMenu(Boolean(appState.contextMenu))
    handleCurrentItemRoundness(appState.currentItemRoundness)
    handleCurrentItemRoughness(appState.currentItemRoughness)

    if(appState.cursorButton === pointerStateEnm.DOWN && Boolean(activeElsLeng)) {
      if(StoreElsLeng < activeElsLeng) {
        const streaming_element = cloneDeep({...excalidrawElements.at(-1), frameId:getUserId}) as ExcalidrawElement
        handleStreaming_addEl({data : streaming_element})
      }
    }

  }

  return (
    <div style={{height:"calc(100dvh - 100px)"}}  >
      <Excalidraw
        langCode='ko-KR' 
        initialData={null}
        gridModeEnabled={true} 
        onChange={onChange}
        excalidrawAPI={onExcalidrawAPI}
        onPointerUpdate={onPointerUpdate}
        />
    </div> 
  );
};
export default ExcalidrawWrapper;

/*
  const onChange = (excalidrawElements:readonly ExcalidrawElement[], appState: ExcalidrawTypes.AppState) => {    
    const activeEls = excalidrawElements.filter(({isDeleted}) => !isDeleted)
    const activeElsLeng = activeEls.length || 0

    handleHideContextMenu(Boolean(appState.contextMenu))
    handleCurrentItemRoundness(appState.currentItemRoundness)
    handleCurrentItemRoughness(appState.currentItemRoughness)

    if(appState.cursorButton === pointerStateEnm.DOWN && Boolean(activeElsLeng)) {
      if(StoreElsLeng < activeElsLeng) {
        const streaming_element = cloneDeep({...excalidrawElements.at(-1), frameId:getUserId}) as ExcalidrawElement
        handleStreaming_addEl({data : streaming_element})
      }

      if(StoreElsLeng === activeElsLeng) {
        const moveEls = activeEls.filter(({x,y, angle},idx) => 
          totalState[idx].x != x || 
          totalState[idx].y != y || 
          totalState[idx].angle != angle 
        )
        const findOwsEls = moveEls.filter(({frameId}) => frameId === getUserId)
        const findOtherEls = moveEls.filter(({frameId}) => frameId != getUserId).map(({id}) => id)
        const isFindOwsEls = Boolean(findOwsEls.length)
        const isfindOtherEls = Boolean(findOtherEls.length)
         
        if(isFindOwsEls) {
        handleStreaming_MoveEls({data : findOwsEls })
        }
        if(isfindOtherEls) {
          const originOtherEls = totalState.filter(({id}) => findOtherEls.includes(id))   
          handleStreaming_MoveOtherReset(originOtherEls)
        }
      }
    }

    if(appState.cursorButton === pointerStateEnm.UP && Boolean(activeElsLeng)) {
      if(StoreElsLeng === activeElsLeng) {
        const changeColorEls = activeEls.filter(({strokeColor},idx) => totalState[idx].strokeColor != strokeColor)
        const findOwsEls = changeColorEls.filter(({frameId}) => frameId === getUserId)
        const isFindOwsEls = Boolean(findOwsEls.length)
        if(isFindOwsEls) {
          handleChange_StrokeColorEls({data : findOwsEls}) 
        }
      }
    }

    if(appState.cursorButton === pointerStateEnm.UP && !Boolean(activeElsLeng)) {
      handle_Remove(activeEls as ExcalidrawElement[])()
    }
  }
*/