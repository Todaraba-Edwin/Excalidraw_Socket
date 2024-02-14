"use client";
import React from 'react'
import { Excalidraw } from "@excalidraw/excalidraw";
import './drawbody.css'

const ExcalidrawWrapper: React.FC = () => {

  return (
    <div style={{height:"calc(100dvh - 100px)"}} >
      <Excalidraw langCode='ko-KR' gridModeEnabled={true} />
    </div> 
  );
};
export default ExcalidrawWrapper;