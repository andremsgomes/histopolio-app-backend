const mongoose = require("mongoose");
const User = require("../src/models/User");
const dotenv = require("dotenv");

async function run() {
  dotenv.config();

  await mongoose.connect(process.env.MONGO_URL);

  const result = await User.updateMany(
    { language: { $exists: false } },
    { $set: { language: "pt" } }
  );

  console.log("Updated users:", result.modifiedCount);

  process.exit();
}

run();