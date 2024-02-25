import * as Redux from "@/lib/modules/excalidrawSlice";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { useEffect, useRef } from "react"
import { Socket } from "socket.io";
import { io } from "socket.io-client"
import { useExcalidrawSlice } from "./useExcalidrawSlice";

type JOIN_ROOM = string;
// {}
type MESSAGE_ElProps = {
  room :JOIN_ROOM
  message : ExcalidrawElement
  // STREAM_MESSAGE
}

// {}[]
type MESSAGE_ElsProps = {
  room :JOIN_ROOM
  message : ExcalidrawElement[]
}

const SOCKET_SERVER_URL = 'http://localhost:3003';

export const useSocket = ({room_Name}: {
    // getUserId:string;
    room_Name:string;
}) => {
    const socketRef = useRef<Socket| any | null>(null)
    const { handleExcalidrawSelectDispatch } = useExcalidrawSlice()
    useEffect(()=>{
        socketRef.current = io(SOCKET_SERVER_URL) 

        // only_Socket Receive //
        if(socketRef.current) {
            const socket = socketRef.current
            socket.on("connect", () => {
              socket.emit("join_room", room_Name);

                // streaming_element
                socket.on('stream_receive_message', (data:MESSAGE_ElProps) => {
                  // other -> store
                  handleExcalidrawSelectDispatch(Redux.setStreamEl, data);
                })
      
                // add
                socket.on('add_receive_message', (data:MESSAGE_ElProps) => {
                  // other -> store
                  handleExcalidrawSelectDispatch(Redux.setAddOtherEl, data);
                })
      
                // stream_move_receive_message
                socket.on('stream_move_receive_message', (data:MESSAGE_ElsProps) => {
                  console.log('data', data.message);
                  handleExcalidrawSelectDispatch(Redux.setStreamMove_Els, data)
                  // other -> store
                })
      
                // change_strokeColor

      
                // remove

      
                // reset

            });
          }    
          return () => {
            if(socketRef.current) {
              socketRef.current.disconnect();
            }
          };
       
    },[])
    return {socketAPI:socketRef.current}
}