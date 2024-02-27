import React from 'react'
import dynamic from "next/dynamic";
import StoreProvider from '../StoreProvider';
import UserPointers from './UserPointers';

const ExcalidrawWrapper = dynamic(
  async () => (await import("./DrawBody")).default,
  {
    ssr: false,
  },
)

export function Excalidraw() {
  return (
      <StoreProvider>
        <div style={{height:"calc(100dvh - 100px)", position:'relative'}}>
        <ExcalidrawWrapper/>
        <UserPointers />
        </div>
      </StoreProvider>
  )
  
}
