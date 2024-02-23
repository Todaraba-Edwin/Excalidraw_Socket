import { useAppSelector } from "@/lib/hooks";
import { useEffect, useRef, useState } from "react";
import * as Redux from "@/lib/modules/excalidrawSlice";
import { ExcalidrawElement, StrokeRoundness } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { Socket } from "socket.io";
import cloneDeep from 'lodash/cloneDeep'
import { useExcalidrawSlice } from "./useExcalidrawSlice";

export enum pointerStateEnm { DOWN = 'down', UP = 'up'}
enum StrokeRoundnessEnum { ROUND ="round", SHARP = "sharp"}
type SOCKETAPI_TYPE = Socket | any | null
type SOCKET_TYPE = {
    socket : {
        socketAPI:SOCKETAPI_TYPE
        room:string
    }
}
type handle_ElProps = SOCKET_TYPE & {
    data : ExcalidrawElement
}
type handle_ElsProps =  SOCKET_TYPE & {
    data : ExcalidrawElement[]
}

export const useExcalidraw = (getUserId:string, room_Name:string, socketAPI:SOCKETAPI_TYPE) => {
    const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null)
    const {totalState} = useAppSelector(Redux.selectExcalidrawElements)
    const [pointerState, setPointerState] = useState<pointerStateType>(pointerStateEnm.UP)
    const [ischangeElement, setIschangeElement] = useState<boolean>(false)
    const { handleExcalidrawSelectDispatch } = useExcalidrawSlice();

    const handleChangePointerState = (button: pointerStateType) => {
        if(pointerState === pointerStateEnm.DOWN && pointerState != button) {
            !ischangeElement && setIschangeElement(true)
        } else {
            ischangeElement && setIschangeElement(false)
        }
        setPointerState(button)
    }

    // appState.contextMenu Handle
    const handleHideContextMenu = (isContextMenu:boolean) => {
        if(isContextMenu && excalidrawRef.current) {
            excalidrawRef.current.updateScene({
                appState:{
                    contextMenu:null
                }
            })
        }  
    }
    
    // appState.currentItemRoundness Handle
    const handleCurrentItemRoundness = (currentItemRoundness:StrokeRoundness) => {
        if(currentItemRoundness === StrokeRoundnessEnum.ROUND && excalidrawRef.current) {
            excalidrawRef.current.updateScene({
                appState:{
                    currentItemRoundness : StrokeRoundnessEnum.SHARP
                }
            })
        }
    }
    const handleCurrentItemRoughness = (currentItemRoughness:number) => {
        if(currentItemRoughness != 0 && excalidrawRef.current) {
            excalidrawRef.current.updateScene({
                appState:{
                    currentItemRoughness : 0
                }
            })
        }
    }

    /*  Excalidraw.onChange.!!nonTracked user.MouseEvent 
        - streaming_element, add writing
        - streaming_elements, moving Elements
        - chagne_strokeColor | chagne_angle
        - reset : own+other, only other, only own 
    */
    // socketAPI:Socket | any | null, room:string, userId:string,excalidrawElements:ExcalidrawElement | undefined
    const handleStreaming_addEl = ({socket : { socketAPI, room}, data }:handle_ElProps) => {
        if(socketAPI) {
            socketAPI.emit('stream_message',{ room, message: data})
        }
    }
    const handle_addEl = ({socket : { socketAPI, room}, data }:handle_ElProps) => {
        if(socketAPI) {
            socketAPI.emit('add_message',{ room, message: data})
        }
    }
    const handleStreaming_MoveEls = ({socket : { socketAPI, room}, data }:handle_ElsProps) => {
        if(socketAPI) {
            socketAPI.emit('stream_move_Element',{ room, message: data})
        }
    }
    const handle_MovefEls = ({socket : { socketAPI, room}, data }:handle_ElsProps) => {
        if(socketAPI) {
            socketAPI.emit('move_message',{ room, message: data})
        }
    }

    useEffect(()=>{
        if(ischangeElement && excalidrawRef.current) {
            const excalidrawAPI = excalidrawRef.current;
            const activeEls = excalidrawAPI.getSceneElements();
            const activeElsLeng = activeEls.length || 0
            const StoreElsLeng = totalState.length || 0;
            const totalEls = excalidrawAPI.getSceneElementsIncludingDeleted();

            /*  TODO : handleChangePointerState, EndTime user.MouseEvent
                - add : own -> socket
                - move : own -> socket
                - remove
            */

            // activeElsLeng.true && store < activeEls 큰 경우, isAdd Element
            if(Boolean(activeElsLeng) && StoreElsLeng < activeElsLeng) {
                const insertFramIdEl = cloneDeep({...activeEls.at(-1),  frameId:getUserId}) as ExcalidrawElement
                handleExcalidrawSelectDispatch(Redux.setAddEl, {message:insertFramIdEl})
                handle_addEl({socket : {socketAPI, room : room_Name}, data:insertFramIdEl})
            }
            // activeElsLeng.true && store === activeEls, versionUp, isMove Element
            if(Boolean(activeElsLeng) && StoreElsLeng === activeElsLeng) {
                // console.log('movedState', movedState);
                
                // const movedStateLeng = Boolean(movedState.length || 0)
                // if(movedStateLeng) {
                //     handle_MovefEls({socket : {socketAPI, room : room_Name}, data:movedState})
                // }
            }


           
        }
    },[ischangeElement])

    useEffect(()=>{
        console.log('excalidrawSlice', totalState);
        if(excalidrawRef.current) {
            excalidrawRef.current.updateScene({
                elements: cloneDeep(totalState) as readonly ExcalidrawElement[]
              })
        }
    },[totalState])

    return {
        excalidrawRef,
        handleChangePointerState,
        handleHideContextMenu,
        handleCurrentItemRoundness,
        handleCurrentItemRoughness,
        // onChange_socketAPI
        handleStreaming_addEl,
        handleStreaming_MoveEls
    }
}