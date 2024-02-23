import { useAppSelector } from "@/lib/hooks";
import { useEffect, useRef, useState } from "react";
import { selectExcalidrawElements } from "@/lib/modules/excalidrawSlice";
import { StrokeRoundness } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

enum pointerStateEnm { DOWN = 'down', UP = 'up'}
enum StrokeRoundnessEnum { ROUND ="round", SHARP = "sharp"}

export const useExcalidraw = () => {
    const excalidrawRef = useRef<ExcalidrawImperativeAPI | null>(null)
    const excalidrawSlice = useAppSelector(selectExcalidrawElements)
    const [pointerState, setPointerState] = useState<pointerStateType>(pointerStateEnm.UP)
    const [ischangeElement, setIschangeElement] = useState<boolean>(false)

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

    useEffect(()=>{
        if(ischangeElement && excalidrawRef.current) {
            const excalidrawAPI = excalidrawRef.current;
            const activeEls = excalidrawAPI.getSceneElements();
            const activeElsLeng = activeEls.length || 0
            const StoreElsLeng = excalidrawSlice.length || 0;
            const totalEls = excalidrawAPI.getSceneElementsIncludingDeleted();

            /*  TODO : handleChangePointerState, EndTime user.MouseEvent
                - add
                - move
                - remove
            */
           
        }
    },[ischangeElement])


    return {
        excalidrawRef,
        handleChangePointerState,
        handleHideContextMenu,
        handleCurrentItemRoundness
    }
}