"use client";
import React, { useCallback, useState } from 'react'
import { Excalidraw } from "@excalidraw/excalidraw";
import './drawbody.css'
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types';

const ExcalidrawWrapper: React.FC = () => {
  const userId = 'testUserId'
  const [dataArr, setData] = useState<readonly ExcalidrawElement[] | []>([]); 
  const [dataLeng, setDataLeng] = useState<any>(false);  
  const [pointerState, setPointerState] = useState<"down" | "up">("up")
  const handleDataChange = useCallback((data:readonly ExcalidrawElement[]) =>{
    setData(data)
  },[]);

const handlePointerUpdate = ({button}:{ button: "down" | "up"}) => {
  setPointerState(button)
  if(pointerState === 'down' && pointerState != button) {
    const lastEmlement = {...dataArr.at(-1), groupIds : [ userId ]}
    const newExcalidrawArr = dataArr.map((list, idx) => idx === dataArr.length-1 ?{...list, groupIds:[...list.groupIds, userId] } :list )
    const activeExcalidraw = newExcalidrawArr.filter(({isDeleted}:{isDeleted:boolean}) => !isDeleted)
    console.log('이때 마우스 클릭을 종료했구나', activeExcalidraw);
    console.log('lastEmlement, 정말 추가했을 때', lastEmlement) // 마지막 요소;
    
  }
} 

  return (
    <div style={{height:"calc(100dvh - 100px)"}} >
      <Excalidraw
        onPointerUpdate={handlePointerUpdate}
        langCode='ko-KR' 
        gridModeEnabled={true} 
        onChange={handleDataChange}
        />
    </div> 
  );
};
export default ExcalidrawWrapper;