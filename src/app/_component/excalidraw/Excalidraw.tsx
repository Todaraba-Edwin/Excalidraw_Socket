
import React from 'react'
import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(
  async () => (await import("./DrawBody")).default,
  {
    ssr: false,
  },
)

export function Excalidraw() {
  return <ExcalidrawWrapper/>
}
