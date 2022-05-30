const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaveSchema = new Schema(
  {
    boardId: { type: Schema.ObjectId, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Save", SaveSchema);
