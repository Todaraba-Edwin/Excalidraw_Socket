import { Socket } from "socket.io";
import { io } from "socket.io-client"
import { useEffect, useRef, useState } from "react"
import * as Redux from "@/lib/modules/excalidrawSlice";
import { useExcalidrawSlice } from "./useExcalidrawSlice";
import { UserPonterType, setPointer } from "@/lib/modules/excalidrawPointersSlice";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

type JOIN_ROOM = string;
type MESSAGE_ElProps = {
  room :JOIN_ROOM
  message : ExcalidrawElement
}
type MESSAGE_ElsProps = {
  room :JOIN_ROOM
  message : ExcalidrawElement[]
}

type STREAM_POINTER = {
  room :JOIN_ROOM
  message : UserPonterType
};

const SOCKET_SERVER_URL = 'http://localhost:3003';

export const useSocket = ({room_Name}: {
    room_Name:string;
}) => {
  const [onSocket, setOnSocket] = useState(false)
    const socketRef = useRef<Socket| any | null>(null)
    const { handleExcalidrawSelectDispatch } = useExcalidrawSlice()
    useEffect(()=>{
        if(onSocket) {
          socketRef.current = io(SOCKET_SERVER_URL) 
          if(socketRef.current) {
              const socket = socketRef.current
              socket.on("connect", () => {
                socket.emit("join_room", room_Name);
  
                  socket.on('stream_receive_message', (data:MESSAGE_ElProps) => {   
                    handleExcalidrawSelectDispatch(Redux.setStreamEl, data);
                  })
        
                  socket.on('add_receive_message', (data:MESSAGE_ElProps) => {
                    handleExcalidrawSelectDispatch(Redux.setAddOtherEl, data);
                  })
        
                  socket.on('stream_move_receive_message', (data:MESSAGE_ElsProps) => {
                    handleExcalidrawSelectDispatch(Redux.setChange_Els, data)
                  })
  
                  socket.on('move_receive_message', (data:MESSAGE_ElProps) => {
                    handleExcalidrawSelectDispatch(Redux.setChange_Els, data);
                  })
  
                  socket.on('change_strokeColor_receive_message', (data:MESSAGE_ElProps) => {
                    handleExcalidrawSelectDispatch(Redux.setChange_Els, data);
                  })
        
                  socket.on('remove_receive_message', (data:MESSAGE_ElProps) => {
                    handleExcalidrawSelectDispatch(Redux.setRemove_Els, data);
                  })
  
                  socket.on('stream_pointer_receive_message', (data:STREAM_POINTER) => {
                    // setPointer
                    handleExcalidrawSelectDispatch(setPointer, data);
                  })
              });
            } 
        }
          return () => {
            if(socketRef.current) {
              socketRef.current.disconnect();
            }
          };
       
    },[onSocket])
    return {socketAPI:socketRef.current, onSocket, setOnSocket}
}