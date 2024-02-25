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
  } = useExcalidraw(getUserId, room_Name, socketAPI)

  // TODO : Assign onExcalidrawAPI
  const onExcalidrawAPI = (api: ExcalidrawTypes.ExcalidrawImperativeAPI) => excalidrawRef.current = api;
  // TODO : Tracking user.MouseEvent, UP | DOWN
  const onPointerUpdate = ({button}:{ button: pointerStateType}) => handleChangePointerState(button)

  // TODO : Tracking Excalidraw all Events
  const onChange = (excalidrawElements:readonly ExcalidrawElement[], appState: ExcalidrawTypes.AppState) => {    
    const activeEls = excalidrawElements.filter(({isDeleted}) => !isDeleted)
    const activeElsLeng = activeEls.length || 0
    
    /*  !!init Settings
        - ContextMenu alaways null
        - Roundness alaways sharp, default round
    */

    handleHideContextMenu(Boolean(appState.contextMenu))
    handleCurrentItemRoundness(appState.currentItemRoundness)
    handleCurrentItemRoughness(appState.currentItemRoughness)

    /*  !!nonTracked user.MouseEvent  
        - 1 streaming_element, add writing : own -> others
        - 2 streaming_elements, moving Elements : own -> others
        - 3 chagne_strokeColor | chagne_angle
        - 4 reset : own+other, only other, only own 
    */

    if(appState.cursorButton === pointerStateEnm.DOWN && Boolean(activeElsLeng)) {
      // 1 streaming_element, add writing : own -> others
      if(StoreElsLeng < activeElsLeng) {
        const streaming_element = cloneDeep({...excalidrawElements.at(-1), frameId:getUserId}) as ExcalidrawElement
        handleStreaming_addEl({
          socket : {
            socketAPI,
            room: room_Name, 
          },
          data : streaming_element 
        })
      }

      // 2 streaming_elements, moving Elements : own -> others
      if(StoreElsLeng === activeElsLeng) {
        const moveEls = activeEls.filter(({x,y},idx) => totalState[idx].x != x || totalState[idx].y != y)
        const findOwsEls = moveEls.filter(({frameId}) => frameId === getUserId)
        const findOtherEls = moveEls.filter(({frameId}) => frameId != getUserId)
        const isFindOwsEls = Boolean(findOwsEls.length)
        const isfindOtherEls = Boolean(findOtherEls.length)
         
        if(isFindOwsEls) {
        // TODO 01 - 나의 것만 소켓을 통해서 상대방에서 전달, 

        }
        if(isfindOtherEls) {
        // TODO 02 - 남의 것은 원래대로 원상 복구 해야 하지 않을까? 남의 것은 원상복구
          
        }
      }
    }

    // 3 chagne_strokeColor | chagne_angle
    if(appState.cursorButton === pointerStateEnm.UP && Boolean(activeElsLeng)) {
    
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
      // 2 streaming_elements, moving Elements : own -> others
      if(StoreElsLeng === activeElsLeng) {
        const moveEls = activeEls.filter(({x,y},idx) => totalState[idx].x != x || totalState[idx].y != y)
        const findOwsEls = moveEls.filter(({frameId}) => frameId === getUserId)
        const findOtherEls = moveEls.filter(({frameId}) => frameId != getUserId)
        const isFindOwsEls = Boolean(findOwsEls.length)
        const isfindOtherEls = Boolean(findOtherEls.length)
        // 내것과 남의 것을 구분지어야 하는데, 내것은 이동하고 소켓으로 보내고 
        // 남의 것은 원래대로 원상 복구 해야 하지 않을까? 
        if(isFindOwsEls) {
          handleStreaming_MoveEls({
            socket : {
              socketAPI,
              room: room_Name, 
            },
            data : findOwsEls 
          })
        }
        if(isfindOtherEls) {
          const originOther = totalState.filter(({frameId}) => frameId != getUserId)
          const undoOriginOther = originOther.filter(({x,y}, idx) => x != findOtherEls[idx].x || y != findOtherEls[idx].y)
          handleExcalidrawSelectDispatch(setStreamMove_Els, {message : [...findOwsEls, ...undoOriginOther]})
        }
      }
*/