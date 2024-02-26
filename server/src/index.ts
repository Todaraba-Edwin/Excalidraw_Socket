import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as Type from "./types";
import MessageModel from "./models/addMessage";

const app = express();
const server = http.createServer(app);
const mongoose = require("mongoose");
// const MessageModel = require("./models/addMessage");

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

  // socket.to(data.room).emit("initData_message", data)  // DB에 저장된 친구가 있으면 =>

  //사용자가 페이지를 새로 고침하거나 다시 방문했을 때 이전의 그림을 다시 불러옴
  socket.on(
    "initData_message",
    async (data: Type.MESSAGE_ExcalidrawElement_Arr) => {
      try {
        // roomId에 해당하는 모든 그림을 찾음
        const messages = await MessageModel.find({ room: data.room })
          .sort({ _id: -1 })
          .exec();

        if (messages.length > 0) {
          // 그림 데이터를 클라이언트에게 전송
          socket.to(data.room).emit(
            "linitData_message",
            messages.map((data) => data)
          );
        } else {
          console.log("No messages found for roomId:", data.room);
        }
      } catch (error) {
        console.error("Error loading messages:", (error as Error).message);
      }
    }
  );

  socket.on("stream_message", (data: Type.STREAM_MESSAGE) => {
    console.log(data);
    socket.to(data.room).emit("stream_receive_message", data);
  });

  socket.on("stream_move_Element", (data: Type.STREAM_MOVE_MESSAGE) => {
    // console.log(data);
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

  // 존재하는 개체들 묶음을 이동할 때 // ??? 마우스 클릭기준이 아닌둣
  socket.on("move_message", async (data: Type.MOVE_MESSAGE) => {
    try {
      for (const element of data.message) {
        // ExcalidrawElement의 id를 사용하여 해당 메시지를 찾아 업데이트
        await MessageModel.updateOne(
          { id: element.id },
          { $set: element } // ExcalidrawElement의 모든 필드를 업데이트
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

  socket.on("change_strokeColor_message", (data: Type.MOVE_MESSAGE) => {
    // console.log(data);
    socket.to(data.room).emit("change_strokeColor_receive_message", data);
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

  socket.on("reset_message", (data: Type.REMOVE_MESSAGE) => {
    // console.log(data);
    socket.to(data.room).emit("reset_receive_message", data);
  });
});

server.listen(3003, () => {
  console.log("Server is Running");
});
