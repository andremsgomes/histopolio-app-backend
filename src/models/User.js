const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    avatarUrl: { type: String, required: true },
    adminToken: String,
    language: { type: String, default: "en" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
