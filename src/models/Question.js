const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema(
  {
    tileId: { type: Schema.ObjectId, required: true },
    question: { type: String, required: true },
    image: String,
    answers: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
