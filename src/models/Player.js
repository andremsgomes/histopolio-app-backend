const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlayerSchema = new Schema(
  {
    userId: { type: Schema.ObjectId, required: true },
    saveId: { type: Schema.ObjectId, required: true },
    points: { type: Number, required: true },
    boardPosition: { type: Number, required: true },
    turns: { type: Number, required: true },
    totalAnswers: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    badges: { type: [Schema.ObjectId], required: true },
    finishedBoard: { type: Boolean, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Player", PlayerSchema);