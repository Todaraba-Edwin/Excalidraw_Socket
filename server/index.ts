import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as Type from "./types.d";
import MessageModel from "./addMessage";
require("dotenv").config();

const mongodbUri = process.env.MONGODB_URI_DEV;

const app = express();
app.use(cors());

const server = http.createServer(app);

const mongoose = require("mongoose");
mongoose.connect(mongodbUri, {});

const db = mongoose.connection;
const io = new Server(server, {
  cors: {
    // origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    origin: "https://m5-dev.matamath.net",
    //origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
  // Additional debugging log to list collections
  mongoose.connection.db
    .listCollections()
    .toArray((err: any, collections: any[]) => {
      if (err) {
        console.error("Error listing collections:", err);
      } else {
        console.log("Collections in the 'canvas' database:", collections);
      }
    });

  // 헬스체크 API 라우터
  app.get("health", (req, res) => {
    res.status(200).json({ status: "OK" });
  });

  // const nsp = io.of("/canvas/api");

  io.on("connection", (socket) => {
    console.log("nsp연결됨?");
    socket.on("join_room", (room: Type.JOIN_ROOM) => {
      socket.join(room);
    });
    // socket.to(data.room).emit("initData_message", data)  // DB에 저장된 친구가 있으면 =>

    // 개체가 추가되었을 때, 하나
    socket.on("stream_message", (data: Type.STREAM_MESSAGE) => {
      console.log(data);
      socket.to(data.room).emit("stream_receive_message", data);
    });

    // 존재하는 개체들 묶음을 이동할 때
    socket.on("stream_move_Element", (data: Type.STREAM_MOVE_MESSAGE) => {
      console.log(data);
      socket.to(data.room).emit("stream_move_receive_message", data);
    });

    socket.on("add_message", async (data: Type.ADD_MESSAGE) => {
      console.log("Received add_message data:", data);

      try {
        const message = new MessageModel(data);
        await message.save();
        socket.to(data.room).emit("add_receive_message", data);
        console.log("add_message data saved:", data);
      } catch (error) {
        console.error(
          "Error saving add_message data:",
          (error as Error).message
        );
      }
    });

    socket.on("move_message", async (data: Type.MOVE_MESSAGE) => {
      console.log(data);
      try {
        for (const element of data.message) {
          await MessageModel.updateOne(
            { "message.id": element.id },
            { $set: { message: element } }
          );
        }
        socket.to(data.room).emit("move_receive_message", data);
      } catch (error) {
        console.error(
          "Error updating move_message data:",
          (error as Error).message
        );
      }
    });

    socket.on("change_strokeColor_message", async (data: Type.MOVE_MESSAGE) => {
      console.log(data);
      try {
        for (const element of data.message) {
          const result = await MessageModel.updateOne(
            { "message.id": element.id },
            { $set: { "message.strokeColor": element.strokeColor } }
          );
        }
        // 변경된 결과를 클라이언트에게 다시 전달
        socket.to(data.room).emit("change_strokeColor_receive_message", data);
      } catch (error) {
        console.error("Error updating ExcalidrawElements:", error);
      }
    });

    socket.on("remove_message", async (data: Type.REMOVE_MESSAGE) => {
      console.log(data);
      try {
        // 배열 안에 있는 모든 messageId에 해당하는 메시지를 삭제
        await MessageModel.deleteMany({
          room: data.room,
          "message.id": { $in: data.message },
        });
        socket
          .to(data.room)
          .emit("remove_receive_messages", { messageIds: data.message });

        console.log("Messages deleted successfully:", data.message);
      } catch (error) {
        console.error("Error deleting messages:", (error as Error).message);
      }
    });

    socket.on("stream_pointer", (data: Type.STREAM_MESSAGE) => {
      console.log(data);
      socket.to(data.room).emit("stream_pointer_receive_message", data);
    });
  });
});

const port = 3003;
server.listen(port, () => {
  console.log("==================");
  console.log(`Server is Running ${port}`);
  console.log("==================");
});
