import * as Redux from "@/lib/modules/excalidrawSlice";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { useEffect, useRef } from "react"
import { Socket } from "socket.io";
import { io } from "socket.io-client"
import { useExcalidrawSlice } from "./useExcalidrawSlice";

type JOIN_ROOM = string;
type MESSAGE_ElProps = {
  room :JOIN_ROOM
  message : ExcalidrawElement
}
type MESSAGE_ElsProps = {
  room :JOIN_ROOM
  message : ExcalidrawElement[]
}

const SOCKET_SERVER_URL = 'http://localhost:3003';

export const useSocket = ({room_Name}: {
    room_Name:string;
}) => {
    const socketRef = useRef<Socket| any | null>(null)
    const { handleExcalidrawSelectDispatch } = useExcalidrawSlice()
    useEffect(()=>{
        socketRef.current = io(SOCKET_SERVER_URL) 

        if(socketRef.current) {
            const socket = socketRef.current
            socket.on("connect", () => {
              socket.emit("join_room", room_Name);

                socket.on('stream_receive_message', (data:MESSAGE_ElProps) => {   
                  console.log(data);
                  handleExcalidrawSelectDispatch(Redux.setStreamEl, data);
                })
      
                socket.on('add_receive_message', (data:MESSAGE_ElProps) => {
                  handleExcalidrawSelectDispatch(Redux.setAddOtherEl, data);
                })
      
                socket.on('stream_move_receive_message', (data:MESSAGE_ElsProps) => {
                  console.log('stream_move_receive_message');
                  handleExcalidrawSelectDispatch(Redux.setChange_Els, data)
                })

                socket.on('move_receive_message', (data:MESSAGE_ElProps) => {
                  handleExcalidrawSelectDispatch(Redux.setChange_Els, data);
                })

                socket.on('change_strokeColor_receive_message', (data:MESSAGE_ElProps) => {
                  console.log('change_strokeColor_receive_message');
                  handleExcalidrawSelectDispatch(Redux.setChange_Els, data);
                })
      
                socket.on('remove_receive_message', (data:MESSAGE_ElProps) => {
                  console.log('remove_receive_message', data);
                  handleExcalidrawSelectDispatch(Redux.setRemove_Els, data);
                })
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