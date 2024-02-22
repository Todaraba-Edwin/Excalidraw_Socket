import express from "express";
import http from "http";
import { Server } from 'socket.io';
import cors from "cors";
import * as Type from './types.d'

const app = express();
app.use(cors());

const server = http.createServer(app)

const io = new Server(server, {
  cors : {
    origin:"http://localhost:3001",
    methods: ["GET", "POST"]
  }
})

io.on("connection", (socket)=>{
  
  socket.on("join_room", (room:Type.JOIN_ROOM)=> {
    socket.join(room)
 })

  socket.on("stream_message", (data:Type.STREAM_MESSAGE)=> {
    console.log(data);
    socket.to(data.room).emit("stream_receive_message", data)
  })

  socket.on("stream_move_Element", (data:Type.STREAM_MOVE_MESSAGE)=> {
    console.log(data);
    socket.to(data.room).emit("stream_move_receive_message", data)
  })

  socket.on("add_message", (data:Type.ADD_MESSAGE)=> {
    console.log(data);
    socket.to(data.room).emit("add_receive_message", data)
  })

  socket.on("move_message", (data:Type.MOVE_MESSAGE)=> {
    console.log(data);
    socket.to(data.room).emit("move_receive_message", data)
  })

  socket.on("remove_message", (data:Type.REMOVE_MESSAGE)=> {
    console.log(data);
    socket.to(data.room).emit("remove_receive_message", data)
  })

})

server.listen(3003, ()=>{
  console.log("Server is Running");
})