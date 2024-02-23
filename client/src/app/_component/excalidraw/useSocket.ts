import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

const SOCKET_SERVER_URL = 'http://localhost:3003';

export const useSocket = ({room_Name}: {
    // getUserId:string;
    room_Name:string;
}) => {
    const socketRef = useRef<any>(null)
    useEffect(()=>{
        socketRef.current = io(SOCKET_SERVER_URL)

        if(socketRef.current) {
            const socket = socketRef.current
            socket.on("connect", () => {
              socket.emit("join_room", room_Name);

                // stream

      
                // add

      
                // move

      
                // change_strokeColor

      
                // remove

      
                // reset

            });
          }    
          return () => {
            socketRef.current.disconnect();
          };
       
    },[])

}