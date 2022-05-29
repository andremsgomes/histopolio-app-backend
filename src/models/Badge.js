const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BadgeSchema = new Schema(
  {
    boardId: { type: Schema.ObjectId, required: true },
    name: { type: String, required: true },
    multiplier: { type: Number, required: true },
    cost: { type: Number, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Badge", BadgeSchema);
