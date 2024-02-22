import express from "express";
import http from "http";
import { Server } from 'socket.io';
import cors from "cors";

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
  
  socket.on("join_room", (room:JOIN_ROOM)=> {
    socket.join(room)
 })

  socket.on("stream_message", (data:STREAM_MESSAGE)=> {
    console.log(data);
    socket.to(data.room).emit("stream_receive_message", data)
  })

  socket.on("stream_move_Element", (data:STREAM_MOVE_MESSAGE)=> {
    console.log(data);
    socket.to(data.room).emit("stream_move_receive_message", data)
  })

  socket.on("add_message", (data:ADD_MESSAGE)=> {
    console.log(data);
    socket.to(data.room).emit("add_receive_message", data)
  })

  socket.on("move_message", (data:MOVE_MESSAGE)=> {
    console.log(data);
    socket.to(data.room).emit("move_receive_message", data)
  })

  socket.on("remove_message", (data:REMOVE_MESSAGE)=> {
    console.log(data);
    socket.to(data.room).emit("remove_receive_message", data)
  })

})

server.listen(3003, ()=>{
  console.log("Server is Running");
})