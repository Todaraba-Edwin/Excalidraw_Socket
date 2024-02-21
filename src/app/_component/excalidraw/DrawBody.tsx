"use client";
import './drawbody.css'
import React, { useEffect, useRef, useState } from 'react'
import { Excalidraw } from "@excalidraw/excalidraw";
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AppState, BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';
import * as Redux from '@/lib/modules/excalidrawSlice';
import { io } from 'socket.io-client';
import cloneDeep from 'lodash/cloneDeep'
type pointerStateType = "down" | "up"
enum pointerStateEnm { DOWN = 'down', UP = 'up'}
const SOCKET_SERVER_URL = 'http://localhost:3003';
const ROOM_NAME = 'roomName';

const ExcalidrawWrapper: React.FC = () => {
  const [userId, setUserId] = useState('')
  const [pointerState, setPointerState] = useState<pointerStateType>(pointerStateEnm.UP)
  const [ischangeElement, setIschangeElement] = useState<boolean>(false)
  const excalidrawElementsSlice = useAppSelector(Redux.selectExcalidrawElements)
  const dispatch = useAppDispatch();
  const socketRef = useRef<any>(null)
  const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null)
  
  const handlePointerUpdate = ({button}:{ button: pointerStateType}) => {
    if(pointerState === pointerStateEnm.DOWN && pointerState != button) setIschangeElement(true)
    else setIschangeElement(false)
    setPointerState(button)
  } 

  const handleChange = (excalidrawElements:readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
    const socket = socketRef.current
    
    // stream_add_Element
    if(pointerState ===  pointerStateEnm.DOWN && excalidrawElementsSlice.length < excalidrawElements.length) {
      if(excalidrawElements.at(-1) && socketRef.current) {
        socket.emit("stream_message", { room: ROOM_NAME, message: excalidrawElements.at(-1)})
      }
    }

    // stream_Move_Elements 
    if(pointerState === pointerStateEnm.DOWN && excalidrawElementsSlice.length === excalidrawElements.length) {
      const findElements = excalidrawElements
      .filter(({x, y},idx) => excalidrawElementsSlice[idx].x != x || excalidrawElementsSlice[idx].y != y) || []

    if(!!findElements.length) {
      const ownElement = findElements.filter(({groupIds}) => groupIds.includes(userId)) || []

      if(!!ownElement.length) {
        dispatch(Redux.changeElments(ownElement as ExcalidrawElement[]))
        socket.emit("move_message", { room: ROOM_NAME, message: ownElement})

        } else {
          if (excalidrawRef.current) {
            const cloneElementList = cloneDeep(excalidrawElementsSlice)
            excalidrawRef.current.updateScene({
              elements: cloneElementList as readonly ExcalidrawElement[]
             })
         }
      }
    } 
    }
    
    // move_strokeColor
    if(pointerState === pointerStateEnm.UP && excalidrawElementsSlice.length === excalidrawElements.length) {
      const findElements = excalidrawElements.filter(({strokeColor},idx) => excalidrawElementsSlice[idx].strokeColor != strokeColor)
      const ownElements =  findElements.filter(({groupIds}) => groupIds.includes(userId)) || []
      const otherElements =  findElements.filter(({groupIds}) => !groupIds.includes(userId)) || []
      const socket = socketRef.current

      if(Boolean(ownElements.length) && !Boolean(otherElements.length)) {
        dispatch(Redux.changeElments(ownElements as ExcalidrawElement[]))
        socket.emit("move_message", { room: ROOM_NAME, message: ownElements})
      }
      if(!Boolean(ownElements.length) && Boolean(otherElements.length)) {
        const cloneElementList = cloneDeep(excalidrawElementsSlice)
        if(excalidrawRef.current) {
          excalidrawRef.current.updateScene({
            elements: cloneElementList as readonly ExcalidrawElement[]
          })
        }
      }

      if(Boolean(ownElements.length) && Boolean(otherElements.length)) {
        console.log('여가 문제야... 둘다 있는 경우');
        dispatch(Redux.changeElments(ownElements as ExcalidrawElement[]))
        socket.emit("move_message", { room: ROOM_NAME, message: ownElements})
      }
    }
    
    // contextmenuNull - function
    if(Boolean(appState.contextMenu)) {
            if(excalidrawRef.current) {
        excalidrawRef.current.updateScene({
          appState:{
            contextMenu: null
          }
        })
      }
    }
  }



  useEffect(()=>{
    socketRef.current = io(SOCKET_SERVER_URL)
    const handleSocketMessage = (name:string, action: (payload: any) 
      => any, {message}: {message : ExcalidrawElement | ExcalidrawElement[] | string[]}) => {
      console.log(`${name}_receive_message`, message);
      dispatch(action(message));
    };

    if(socketRef.current) {
      const socket = socketRef.current
      socket.on("connect", () => {
        setUserId(socket.id)
        socket.emit("join_room", ROOM_NAME);

          // stream
          socket.on('stream_receive_message', (data:any) => {
            handleSocketMessage('stream',Redux.streamElements, data);
          })

          // add
          socket.on('add_receive_message', (data:any) => {
            handleSocketMessage('add',Redux.addElements, data);
          })

            // move
            socket.on('move_receive_message', (data:any) => {
              handleSocketMessage('move', Redux.changeElments, data)
            })

          // remove
          socket.on('remove_receive_message', (data:any) => {
            handleSocketMessage('remove',Redux.removeElements, data);
          })
      });
    }    
    return () => {
      socketRef.current.disconnect();
    };
  },[])



 useEffect(()=>{
    if(ischangeElement) {
      const socket = socketRef.current
      const excalidrawAPI = excalidrawRef.current
      const activeSceneElements = excalidrawAPI?.getSceneElements()

      if(activeSceneElements) {
        const activeSceneElementsLeng = activeSceneElements.length;
        const excalidrawElementsSliceLeng = excalidrawElementsSlice.length;

        // addElements
        if(excalidrawElementsSliceLeng < activeSceneElementsLeng) {
          const addElement = {...activeSceneElements.at(-1), groupIds:[userId] }
          dispatch(Redux.addElements(addElement as ExcalidrawElement))
          socket.emit("add_message", { room: ROOM_NAME, message: addElement})
        }

        // moveElements 색상 변경 수정 
        if(excalidrawElementsSliceLeng === activeSceneElementsLeng) {
          const findElements = activeSceneElements
            .filter(({x, y},idx) => excalidrawElementsSlice[idx].x != x || excalidrawElementsSlice[idx].y != y) || []

          if(!!findElements.length) {
            const ownElement = findElements.filter(({groupIds}) => groupIds.includes(userId)) || []

            if(!!ownElement.length) {
              dispatch(Redux.changeElments(ownElement as ExcalidrawElement[]))
              socket.emit("move_message", { room: ROOM_NAME, message: ownElement})

              } else {
                if (excalidrawRef.current) {
                  const cloneElementList = cloneDeep(excalidrawElementsSlice)
                  excalidrawRef.current.updateScene({
                    elements: cloneElementList as readonly ExcalidrawElement[]
                   })
               }
            }
          } 
        }

        // removeElements
        if(excalidrawElementsSliceLeng > activeSceneElementsLeng) {
          const removeElementsIds = excalidrawAPI?.getSceneElementsIncludingDeleted()
            .filter(({isDeleted}) => isDeleted).filter(({groupIds}) => groupIds.includes(userId))
            .map(({id}) => id) || []
            dispatch(Redux.removeElements(removeElementsIds))
          if(!!removeElementsIds.length)  {   
            socket.emit("remove_message", { room: ROOM_NAME, message: removeElementsIds})  
          }
        }  
      }
    }
 },[ischangeElement])

 useEffect(()=>{
  if(excalidrawRef.current) {
    console.log('excalidrawElementsSlice', excalidrawElementsSlice);
    const cloneElementList = cloneDeep(excalidrawElementsSlice)
      excalidrawRef.current.updateScene({
        elements: cloneElementList as readonly ExcalidrawElement[]
      })
    }
 },[excalidrawElementsSlice])



  return (
    <div style={{height:"calc(100dvh - 100px)"}}  >
      <Excalidraw
        initialData={null}
        onChange={handleChange}
        onPointerUpdate={handlePointerUpdate}
        langCode='ko-KR' 
        gridModeEnabled={true} 
        excalidrawAPI={(api: ExcalidrawImperativeAPI) =>{
          excalidrawRef.current = api;
        }}
        />
    </div> 
  );
};
export default ExcalidrawWrapper;
