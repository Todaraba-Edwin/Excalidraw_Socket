import React from 'react'
import dynamic from "next/dynamic";
import StoreProvider from '../StoreProvider';

const ExcalidrawWrapper = dynamic(
  async () => (await import("./DrawBody")).default,
  {
    ssr: false,
  },
)

export function Excalidraw() {
  return (
      <StoreProvider>
        <ExcalidrawWrapper/>
      </StoreProvider>
  )
  
}
