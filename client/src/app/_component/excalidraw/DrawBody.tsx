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
    if(pointerState === pointerStateEnm.DOWN && pointerState != button) {
      !ischangeElement && setIschangeElement(true)
    } else {
      ischangeElement && setIschangeElement(false)
    }
    setPointerState(button)
  } 

  // == handleChange  ============================================================================================================
  const handleChange = (excalidrawElements:readonly ExcalidrawElement[], appState: AppState) => {
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
      const ownElement = findElements.filter(({frameId}) => frameId && frameId.includes(userId)) || []
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
    
    // change_strokeColor
    if(pointerState === pointerStateEnm.UP && excalidrawElementsSlice.length === excalidrawElements.length) {
      const findElements = excalidrawElementsSlice
        .filter(({strokeColor},idx) => excalidrawElements[idx].strokeColor != strokeColor)
        .map((el) => {
          const findElment = excalidrawElements.find(({id}) => id === el.id)
          return {...el, strokeColor: findElment ? findElment.strokeColor : el.strokeColor}
        })
      const ownElements =  findElements.filter(({frameId}) => frameId && frameId.includes(userId)) || []
      const otherElements =  findElements.filter(({frameId}) => frameId && !frameId.includes(userId)) || []
      const socket = socketRef.current

      if(Boolean(ownElements.length) && !Boolean(otherElements.length)) {
        dispatch(Redux.changeElments(ownElements as ExcalidrawElement[]))
        socket.emit("change_strokeColor_message", { room: ROOM_NAME, message: ownElements})
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
        dispatch(Redux.changeElments(ownElements as ExcalidrawElement[]))
        socket.emit("change_strokeColor_message", { room: ROOM_NAME, message: ownElements})
      }
    }

    // reset_elements
    const currentExcalidrawElements = excalidrawElements.filter(({isDeleted}) => !isDeleted).length
    if(Boolean(excalidrawElements.length) && Boolean(excalidrawElementsSlice.length)) {
      const findOthers = excalidrawElementsSlice.filter(({frameId}) => frameId && !frameId.includes(userId)) || []
      if(Boolean(findOthers.length)) {
        if((excalidrawElementsSlice.length > 0 || excalidrawElements.length > 0) && !Boolean(currentExcalidrawElements)) {
          const findOthers = excalidrawElementsSlice.filter(({frameId}) => frameId && !frameId.includes(userId)) || []
          socket.emit("reset_message", { room: ROOM_NAME, message: findOthers})
          if(Boolean(findOthers.length)) {
            setIschangeElement(true)
          } else {
            setIschangeElement(false)
          }
        }
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

  // == useEffect_socketRef ======================================================================================================
  useEffect(()=>{
    socketRef.current = io(SOCKET_SERVER_URL)
    const handleSocketMessage = (action: (payload: any) 
      => any, {message}: {message : ExcalidrawElement | ExcalidrawElement[] | string[]}) => {
      dispatch(action(message));
    };

    if(socketRef.current) {
      const socket = socketRef.current
      socket.on("connect", () => {
        setUserId(socket.id)
        socket.emit("join_room", ROOM_NAME);

          // stream
          socket.on('stream_receive_message', (data:any) => {
            handleSocketMessage(Redux.streamElements, data);
          })

          // add
          socket.on('add_receive_message', (data:any) => {
            handleSocketMessage(Redux.addElements, data);
          })

          // move
          socket.on('move_receive_message', (data:any) => {
            handleSocketMessage(Redux.changeElments, data)
          })

          // change_strokeColor
          socket.on('change_strokeColor_receive_message', (data:any) => {
            handleSocketMessage(Redux.changeElments, data)
          })

          // remove
          socket.on('remove_receive_message', (data:any) => {
            handleSocketMessage(Redux.removeElements, data);
          })

          // reset
          socket.on('reset_receive_message', (data:any) => {
            handleSocketMessage(Redux.resetElements, data);
          })
      });
    }    
    return () => {
      socketRef.current.disconnect();
    };
  },[])


  // == excalidrawElementsSlice 변경될 때 실행 : useEffect_ischangeElement , useEffect_socketRef  =================================

  // useEffect_ischangeElement
  useEffect(()=>{
    if(ischangeElement) { // 마우스 이벤트가 종료되었을 때; onPointerUpdate에 의해 ischangeElement 가 true 가 되었을 때 
      const socket = socketRef.current
      const excalidrawAPI = excalidrawRef.current
      const activeSceneElements = excalidrawAPI?.getSceneElements() // 활성상태 // 삭제된 것은 제외 된 리스트 반환 
      const activeSceneElementsLeng = activeSceneElements ? activeSceneElements.length : 0;
      const excalidrawElementsSliceLeng = excalidrawElementsSlice.length;

      if(activeSceneElements && Boolean(activeSceneElementsLeng)) { // 활성상태 []이 실제로 존재할 때 

        // addElements
        if(excalidrawElementsSliceLeng < activeSceneElementsLeng) {
          dispatch(Redux.addElements({userId, data: activeSceneElements.at(-1) as ExcalidrawElement}))
          socket.emit("add_message", { room: ROOM_NAME, message: {userId, data: {...activeSceneElements.at(-1), frameId:userId} as ExcalidrawElement}})
        }

        // moveElements
        if(excalidrawElementsSliceLeng === activeSceneElementsLeng) {
          const findElements = activeSceneElements
            .filter(({x, y},idx) => excalidrawElementsSlice[idx].x != x || excalidrawElementsSlice[idx].y != y) || []

          if(!!findElements.length) {

            const ownElement = findElements.filter(({frameId}) => frameId && frameId.includes(userId)) || []

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
            .filter(({isDeleted}) => isDeleted).filter(({frameId}) => frameId && frameId.includes(userId))
            .map(({id}) => id) || []
            dispatch(Redux.removeElements(removeElementsIds))
          if(!!removeElementsIds.length)  {   
            socket.emit("remove_message", { room: ROOM_NAME, message: removeElementsIds})  
          }
        }  

      }

      //reset 
      if(!activeSceneElements && Boolean(excalidrawElementsSlice.length)) {
        const findOthers = excalidrawElementsSlice.filter(({frameId}) => frameId && !frameId.includes(userId)) || []
        dispatch(Redux.resetElements(findOthers))
        socket.emit("reset_message", { room: ROOM_NAME, message: findOthers})
      }
    }
 },[ischangeElement])



 // == excalidrawElementsSlice 변경될 때 실행 : useEffect_ischangeElement , useEffect_socketRef  =================================
 useEffect(()=>{
  if(excalidrawRef.current) {
    // console.log('excalidrawElementsSlice', excalidrawElementsSlice)   
    excalidrawRef.current.history.clear(); 
    excalidrawRef.current.updateScene({
      elements: cloneDeep(excalidrawElementsSlice) as readonly ExcalidrawElement[]
    })
  }
 },[excalidrawElementsSlice])


  // ==  return : Excalidraw 컴포넌트 ============================================================================================
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