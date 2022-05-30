const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CardSchema = new Schema(
  {
    type: { type: String, required: true },
    subtype: String,
    boardId: Schema.ObjectId,
    tileId: Schema.ObjectId,
    points: Number,
    action: String,
    actionValue: String,
    info: String,
    content: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", CardSchema);
