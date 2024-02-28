"use client";
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
// style
import './drawbody.css'
// hooks
import { useSocket } from './useSocket';
import { pointerStateEnm, useExcalidraw } from './useExcalidraw';
// Redux
import { useAppSelector } from '@/lib/hooks';
import { ExcalidrawCustomDTO, selectExcalidrawElements } from '@/lib/modules/excalidrawSlice';
// lib
import { Excalidraw } from "@excalidraw/excalidraw";
import * as ExcalidrawTypes from '@excalidraw/excalidraw/types/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import cloneDeep from 'lodash/cloneDeep'

const ExcalidrawWrapper: React.FC = () => {
  const room_Name = 'roomName'
  const getUserId = useSearchParams().get('userId') || ''
  const totalStore = useAppSelector(selectExcalidrawElements)
  const StoreElsLeng = totalStore.length || 0;

  const {socketAPI, onSocket, setOnSocket} = useSocket({room_Name})
  const {
    excalidrawRef, 
    isChecked_radioArrow,
    handleChangePointerState, 
    handleHideContextMenu,
    handleCurrentItemRoundness,
    handleCurrentItemRoughness,
    handleStreaming_pointer,
    handleStreaming_addEl,
    handleStreaming_MoveEls,
    handle_OtherReset,
    handleChange_StrokeColorEls,
    handle_Reset
  } = useExcalidraw(getUserId, room_Name, socketAPI)

  const [isRadioArrow, setIsRadioArrow] = useState<boolean>(false)  
  const onExcalidrawAPI = (api: ExcalidrawTypes.ExcalidrawImperativeAPI) => excalidrawRef.current = api;
  const onPointerUpdate = ({pointer, button}:{ pointer:pointerPointerType,button: pointerButtonType}) => {
    handleChangePointerState(button)
    handleStreaming_pointer(pointer)
    
  }
  const onChange = (excalidrawElements:readonly ExcalidrawElement[], appState: ExcalidrawTypes.AppState) => { 
    const activeEls = excalidrawElements.filter(({isDeleted}) => !isDeleted)
    const activeElsLeng = activeEls.length || 0

    handleHideContextMenu(Boolean(appState.contextMenu))
    handleCurrentItemRoundness(appState.currentItemRoundness)
    handleCurrentItemRoughness(appState.currentItemRoughness)

    if(appState.cursorButton === pointerStateEnm.DOWN && Boolean(activeElsLeng)) {
      // 01 streaming_Add
      if(StoreElsLeng < activeElsLeng) {
        const streaming_element = cloneDeep({...excalidrawElements.at(-1), writerId:getUserId}) as ExcalidrawCustomDTO
        handleStreaming_addEl({data : streaming_element})
      }

      // 02 streaming_Move
      if(StoreElsLeng === activeElsLeng) {        
        const moveEls = activeEls.filter(({x,y, angle, height, width},idx) => 
          totalStore[idx].x != x || 
          totalStore[idx].y != y || 
          totalStore[idx].angle != angle ||
          totalStore[idx].height != height ||
          totalStore[idx].width != width
        ) as ExcalidrawCustomDTO[]

        const findOwsEls = moveEls.filter(({writerId}) => writerId === getUserId)
        const findOtherEls = moveEls.filter(({writerId}) => writerId != getUserId).map(({id}) => id)
        const isFindOwsEls = Boolean(findOwsEls.length)
        const isfindOtherEls = Boolean(findOtherEls.length)
         
        if(isFindOwsEls) {
          handleStreaming_MoveEls({data : findOwsEls })
        }
        if(isfindOtherEls) {
          const originOtherEls = totalStore.filter(({id}) => findOtherEls.includes(id))  
          handle_OtherReset(originOtherEls)
        }
      }
    }

    // 03 changeColorEls
    if(appState.cursorButton === pointerStateEnm.UP && Boolean(activeElsLeng)) {      
      if(StoreElsLeng === activeElsLeng) {
        const upDateEls = activeEls.map((el, idx) => {
          return {...el, writerId: totalStore[idx].writerId}
        })
        const changeColorEls = upDateEls.filter(({strokeColor},idx) => totalStore[idx].strokeColor != strokeColor)
        const findOwsEls = changeColorEls.filter(({writerId}) => writerId === getUserId)
        const isFindOwsEls = Boolean(findOwsEls.length)
        if(isFindOwsEls) {
          handleChange_StrokeColorEls({data : findOwsEls}) 
        }
      }
    }

    // 04 reset
    if(appState.cursorButton === pointerStateEnm.UP && !Boolean(activeElsLeng) && Boolean(StoreElsLeng)) {
      handle_Reset()
    }
  }

  useEffect(()=>{
    isChecked_radioArrow && setIsRadioArrow(isChecked_radioArrow.checked)
  },[isChecked_radioArrow?.checked])

  return (
      <Excalidraw
        langCode='ko-KR' 
        initialData={null}
        gridModeEnabled={true} 
        onChange={onChange}
        excalidrawAPI={onExcalidrawAPI}
        onPointerUpdate={onPointerUpdate}
        >
          <div className='join_Socket' onClick={(e)=>{
              e.stopPropagation()
              setOnSocket(pre => !pre)
          }}>소켓 {`${onSocket ? '닫기': '열기'}`}</div>
          {isRadioArrow && <div className='Checked_radioArrow'>화살표 그리기를 마치시려거든 ESC 를 눌러주세요.</div>} 
          {/* // 764가 분기 되는 화면 그 전에는 65 그 후에는 60 */}
        </Excalidraw>
  );
};
export default ExcalidrawWrapper;