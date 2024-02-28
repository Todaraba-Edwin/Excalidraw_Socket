import { Socket } from "socket.io";
import cloneDeep from 'lodash/cloneDeep'
import { useEffect, useRef, useState } from "react";
import { useExcalidrawSlice } from "./useExcalidrawSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import * as ExcalidrawSlice from "@/lib/modules/excalidrawSlice";
import * as ExcalidrawMoveSlice from "@/lib/modules/excalidrawMovedSlice";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement, StrokeRoundness } from "@excalidraw/excalidraw/types/element/types";
import { setPointer } from "@/lib/modules/excalidrawPointersSlice";

export enum pointerStateEnm { DOWN = 'down', UP = 'up'}
enum StrokeRoundnessEnum { ROUND ="round", SHARP = "sharp"}
type SOCKETAPI_TYPE = Socket | any | null
type handle_ElProps = {
    data : ExcalidrawSlice.ExcalidrawCustomDTO
}
type handle_ElsProps = {
    data : ExcalidrawSlice.ExcalidrawCustomDTO[]
}
type handleRemove_ElsProps = {
    data : string[]
}

export const useExcalidraw = (getUserId:string, room:string, socketAPI:SOCKETAPI_TYPE) => {
    const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null)
    const totalStore = useAppSelector(ExcalidrawSlice.selectExcalidrawElements)
    const moveIdsStore = useAppSelector(ExcalidrawMoveSlice.selectExcalidrawMovedEls)
    const [pointerState, setPointerState] = useState<pointerButtonType>(pointerStateEnm.UP)
    const [ischangeElement, setIschangeElement] = useState<boolean>(false)
    const { handleExcalidrawSelectDispatch } = useExcalidrawSlice();
    const dispatch = useAppDispatch()
    const isChecked_radioLine: HTMLInputElement = document
    .querySelector(".Stack.Stack_horizontal .Island.App-toolbar .Stack.Stack_horizontal input[aria-label='선']")!;
    const isChecked_radioArrow: HTMLInputElement = document
    .querySelector(".Stack.Stack_horizontal .Island.App-toolbar .Stack.Stack_horizontal input[aria-label='화살표']")!;
  
    const handleStreaming_pointer = (pointer:pointerPointerType) => {
        const streamPointer = {
            x:pointer.x,
            y:pointer.y,
            writerId:getUserId
        }
        // socketAPI && socketAPI.emit('stream_pointer',{ room, message: streamPointer})
        dispatch(setPointer(streamPointer))
    }

    const handleChangePointerState = (button: pointerButtonType) => {
        if(pointerState === pointerStateEnm.DOWN && pointerState != button) {
            !ischangeElement && setIschangeElement(true)
        } else {
            ischangeElement && setIschangeElement(false)
        }
        setPointerState(button)
    }

    const handleHideContextMenu = (isContextMenu:boolean) => {
        if(isContextMenu && excalidrawRef.current) {
            excalidrawRef.current.updateScene({
                appState:{
                    contextMenu:null
                }
            })
        }  
    }
    
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

    const handleStreaming_addEl = ({data}:handle_ElProps) => {
        socketAPI && socketAPI.emit('stream_message',{ room, message: data})
    }
    const handleStreaming_MoveEls = ({data}:handle_ElsProps) => {
        socketAPI && socketAPI.emit('stream_move_Element', { room, message: data})
        const findIds = data.map(({id}) => id)
        dispatch(ExcalidrawMoveSlice.setMovedEls(findIds))
        console.log('handleStreaming_MoveEls');
        dispatch(ExcalidrawSlice.setChange_Els(data))
    }
    const handleChange_StrokeColorEls = ({data}:handle_ElsProps) => {
        socketAPI && socketAPI.emit('change_strokeColor_message',{ room, message: data})
        console.log('handleChange_StrokeColorEls');
        dispatch(ExcalidrawSlice.setChange_Els(data))
    }
    const handle_OtherReset = (originOtherEls:ExcalidrawSlice.ExcalidrawCustomDTO[]) => {
        console.log('handleStreaming_MoveOtherReset');
        dispatch(ExcalidrawSlice.setChange_Els(originOtherEls))
    }

    const handle_addEl = ({data}:handle_ElProps) => {
        socketAPI && socketAPI.emit('add_message',{ room, message: data})
    }
    const handle_MoveEls = ({data}:handle_ElsProps) => {  
        socketAPI && socketAPI.emit('move_message',{ room, message: data})
        dispatch(ExcalidrawMoveSlice.setMovedEls([]))
        dispatch(ExcalidrawSlice.setChange_Els(data))
    }
    const on_remove = ({data}:handleRemove_ElsProps) => {  
        socketAPI && socketAPI.emit('remove_message',{ room, message: data})
        dispatch(ExcalidrawSlice.setRemove_Els(data))
    }
    const on_recoverOther = () => {  
        dispatch(ExcalidrawSlice.setRecoverOther_Els())
    }

    const handle_Remove = (activeEls:ExcalidrawElement[]) => {
        const deletedEls = totalStore.filter(({id:totalId}) => !activeEls.some(({id:activeId}) => totalId === activeId))
        const findOwsEls = deletedEls.filter(({writerId}) => writerId === getUserId).map(({id}) => id)
        const findOtherEls = deletedEls.filter(({writerId}) => writerId != getUserId)
        const isFindOwsEls = Boolean(findOwsEls.length)
        const isfindOtherEls = Boolean(findOtherEls.length) 
         
        if(isFindOwsEls) {
            on_remove({data : findOwsEls})
        }
        if(!isFindOwsEls && isfindOtherEls) {
            on_recoverOther()
        }
    }

    const handle_Reset = () => {
        const findOwsEls = totalStore.filter(({writerId}) => writerId === getUserId).map(({id}) => id)
        const findOtherEls = totalStore.filter(({writerId}) => writerId != getUserId)
        const isFindOwsEls = Boolean(findOwsEls.length)
        const isfindOtherEls = Boolean(findOtherEls.length)

        if(isFindOwsEls) {
            on_remove({data : findOwsEls})
        }
        if(!isFindOwsEls && isfindOtherEls) {
            on_recoverOther()
        }
    }

    useEffect(()=>{
        if(ischangeElement && excalidrawRef.current) {
            const excalidrawAPI = excalidrawRef.current;
            const activeEls = excalidrawAPI.getSceneElements();
            const activeElsLeng = activeEls.length || 0
            const StoreElsLeng = totalStore.length || 0;
              
          if(Boolean(activeElsLeng)) {
            // 01 Add
            if(StoreElsLeng < activeElsLeng) {
                console.log('App_toolbar', !isChecked_radioLine.checked);
                const insertFramIdEl = cloneDeep({...activeEls.at(-1),  writerId:getUserId}) as ExcalidrawSlice.ExcalidrawCustomDTO
                if(!isChecked_radioLine.checked && !isChecked_radioArrow.checked) {
                    handleExcalidrawSelectDispatch(ExcalidrawSlice.setAddEl, {message:insertFramIdEl})
                    handle_addEl({data:insertFramIdEl})
                }
            }
            
            // 02 Move
            if(StoreElsLeng === activeElsLeng) {
                const moveOwnEls = totalStore.filter(({id}) => moveIdsStore.includes(id))
                const moveOtherEls = totalStore.filter(({id}) => !moveIdsStore.includes(id))
                const moveOwnElsLeng = Boolean(moveOwnEls.length)
                moveOwnElsLeng && handle_MoveEls({data:moveOwnEls})
                moveOtherEls && on_recoverOther()
            }
          }

          // 03 remove
          if(Boolean(StoreElsLeng) && StoreElsLeng > activeElsLeng) {
            handle_Remove(activeEls as ExcalidrawSlice.ExcalidrawCustomDTO[])
          }
        }
    },[ischangeElement])

    
    useEffect(()=>{
        if(excalidrawRef.current) {
            const clone = cloneDeep(totalStore) as readonly ExcalidrawElement[]
            excalidrawRef.current.history.clear()
            excalidrawRef.current.updateScene({
                elements: clone
              })
        }
    },[totalStore])

    return {
        excalidrawRef,
        isChecked_radioArrow,
        handleChangePointerState,
        handleHideContextMenu,
        handleCurrentItemRoundness,
        handleCurrentItemRoughness,
        // onPointerUpdate_socketAPI
        handleStreaming_pointer,
        // onChange_socketAPI
        handleStreaming_addEl,
        handleStreaming_MoveEls,
        handle_OtherReset,
        handleChange_StrokeColorEls,
        handle_Reset
    }
}