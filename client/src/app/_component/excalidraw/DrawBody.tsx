"use client";
import React from 'react'
import { useSearchParams } from 'next/navigation';
// style
import './drawbody.css'
// hooks
import { useSocket } from './useSocket';
import { useExcalidraw } from './useExcalidraw';
// Redux
import { useAppSelector } from '@/lib/hooks';
import { selectExcalidrawElements } from '@/lib/modules/excalidrawSlice';
// lib
import { Excalidraw } from "@excalidraw/excalidraw";
import * as ExcalidrawTypes from '@excalidraw/excalidraw/types/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';


const ExcalidrawWrapper: React.FC = () => {
  useSocket({room_Name: 'roomName'})
  const getUserId = useSearchParams().get('userId') || ''
  const excalidrawSlice = useAppSelector(selectExcalidrawElements)

  const {
    excalidrawRef, 
    handleChangePointerState, 
    handleHideContextMenu,
    handleCurrentItemRoundness
  } = useExcalidraw()

  // TODO : Assign onExcalidrawAPI
  const onExcalidrawAPI = (api: ExcalidrawTypes.ExcalidrawImperativeAPI) => excalidrawRef.current = api;
  // TODO : Tracking user.MouseEvent, UP | DOWN
  const onPointerUpdate = ({button}:{ button: pointerStateType}) => handleChangePointerState(button)

  // TODO : Tracking Excalidraw all Events
  const onChange = (excalidrawElements:readonly ExcalidrawElement[], appState: ExcalidrawTypes.AppState) => {
    
    /*  !!init Settings
        - ContextMenu alaways null
        - Roundness alaways sharp, default round
    */

    handleHideContextMenu(Boolean(appState.contextMenu))
    handleCurrentItemRoundness(appState.currentItemRoundness)

    /*  !!nonTracked user.MouseEvent  
        - streaming_element, add writing
        - streaming_elements, moving Elements
        - chagne_strokeColor | chagne_angle
        - reset : own+other, only other, only own 
    */


   
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