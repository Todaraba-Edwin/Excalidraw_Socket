import mongoose, { Document, Schema } from "mongoose";
import { JOIN_ROOM, ExcalidrawElement } from "../types";

// MongoDB 스키마 정의
interface MessageDocument extends Document {
  room: JOIN_ROOM;
  message: {
    userId: string;
    data: ExcalidrawElement | ExcalidrawElement[] | string[] | any;
  };
}

const messageSchema = new Schema<MessageDocument>(
  {
    room: {
      type: String,
      required: true,
    },
    message: {
      userId: {
        type: String,
        required: true,
      },
      data: {
        type: Schema.Types.Mixed,
        required: true,
      },
    },
  },
  { timestamps: true }
);

// MongoDB 모델 생성
const MessageModel = mongoose.model<MessageDocument>("Message", messageSchema);

export default MessageModel;
