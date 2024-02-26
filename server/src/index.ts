import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as Type from "./types";
import MessageModel from "./models/addMessage";

const app = express();
const server = http.createServer(app);
const mongoose = require("mongoose");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

mongoose.connect("mongodb://localhost:27017/draw");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

io.on("connection", (socket) => {
  socket.on("join_room", (room: Type.JOIN_ROOM) => {
    socket.join(room);
  });

  socket.on("stream_message", (data: Type.STREAM_MESSAGE) => {
    console.log(data);
    socket.to(data.room).emit("stream_receive_message", data);
  });

  socket.on("stream_move_Element", (data: Type.STREAM_MOVE_MESSAGE) => {
    console.log("stream_move_Element", data);
    socket.to(data.room).emit("stream_move_receive_message", data);
  });

  // 개체가 추가되었을 때, 하나
  socket.on("add_message", async (data: Type.ADD_MESSAGE) => {
    console.log("add_message", JSON.stringify(data));
    try {
      const message = new MessageModel(data);
      await message.save();
      console.log("add_message data saved:", data);
    } catch (error) {
      console.error("Error saving add_message data:", (error as Error).message);
    }
    socket.to(data.room).emit("add_receive_message", data);
  });

  // 존재하는 개체들 묶음을 이동할 때 // ??? 마우스 클릭기준이 아닌듯 하다!
  socket.on("move_message", async (data: Type.MOVE_MESSAGE) => {
    try {
      for (const element of data.message) {
        // ExcalidrawElement의 id를 사용하여 해당 메시지를 찾아 업데이트
        await MessageModel.updateOne(
          { "message.data.id": element.id },
          { $set: { "message.data": element } }
        );
      }
      console.log("Messages updated successfully:", data.message);
    } catch (error) {
      console.error(
        "Error updating update_message data:",
        (error as Error).message
      );
    }
    socket.to(data.room).emit("move_receive_message", data);
  });

  //개체 색상 변경

  socket.on("change_strokeColor_message", async (data: Type.MOVE_MESSAGE) => {
    console.log("change_strokeColor_message", data);

    try {
      for (const element of data.message) {
        const result = await MessageModel.updateOne(
          { "message.data.id": element.id },
          { $set: { "message.data.strokeColor": element.strokeColor } }
        );
        console.log(
          `Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`
        );
        console.log(
          `ExcalidrawElement with id ${element.id} - strokeColor updated successfully.`
        );
      }
      // 변경된 결과를 클라이언트에게 다시 전달
      socket.to(data.room).emit("change_strokeColor_receive_message", data);
    } catch (error) {
      console.error("Error updating ExcalidrawElements:", error);
    }
  });

  //개체 하나 혹은 여러개 삭제할때
  socket.on("remove_message", async (data: Type.REMOVE_MESSAGE) => {
    console.log("remove_message", JSON.stringify(data));
    try {
      // 배열 안에 있는 모든 messageId에 해당하는 메시지를 삭제
      await MessageModel.deleteMany({
        room: data.room,
        "message.data.id": { $in: data.message },
      });
      console.log("Messages deleted successfully:", data.message);

      // 클라이언트에게 삭제 완료를 알리는 코드 추가
      socket
        .to(data.room)
        .emit("remove_receive_messages", { messageIds: data.message });
    } catch (error) {
      console.error("Error deleting messages:", (error as Error).message);
    }
  });

  //캔버스 초기화
  socket.on("reset_message", (data: Type.REMOVE_MESSAGE) => {
    console.log("reset_message", data);
    socket.to(data.room).emit("reset_receive_message", data);
  });
});

server.listen(3003, () => {
  console.log("Server is Running");
});
