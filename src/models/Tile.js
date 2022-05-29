const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TileSchema = new Schema(
  {
    boardId: { type: Schema.ObjectId, required: true },
    boardPosition: { type: Number, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },
    rotation: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
      w: { type: Number, required: true },
    },
    points: { type: Number },
    groupColor: {
      r: { type: Number },
      g: { type: Number },
      b: { type: Number },
      a: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tile", TileSchema);
