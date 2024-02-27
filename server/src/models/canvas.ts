import mongoose from "mongoose";

const canvasSchema = new mongoose.Schema({
  room: String,
  message: {
    userId: String,
    data: {
      id: String,
      type: String,
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      angle: Number,
      strokeColor: String,
      backgroundColor: String,
      fillStyle: String,
      strokeWidth: Number,
      strokeStyle: String,
      roughness: Number,
      opacity: Number,
      groupIds: [String],
      frameId: String,
      roundness: Number,
      seed: Number,
      version: Number,
      versionNonce: Number,
      isDeleted: Boolean,
      boundElements: Number,
      updated: Number,
      link: String,
      locked: Boolean,
      points: [Array],
      pressures: [Number],
      simulatePressure: Boolean,
      lastCommittedPoint: [Array],
    },
  },
});

const Canvas = mongoose.model("Draw", canvasSchema);
module.exports = Canvas;
