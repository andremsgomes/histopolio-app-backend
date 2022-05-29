const bcrypt = require("bcrypt");

const User = require("../models/User");

async function seedUsers() {
  // Create admin
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hash("admin123!", salt);
  await User.create({
    name: "Admin",
    email: "admin@up.pt",
    password: hashedPassword,
    avatarUrl: "https://www.linkpicture.com/q/user_21.png",
    adminToken:
      "3<W--x7CSNUT_HBB>=&1Oc(_S9d'UjvZD%-=2`xU/.<xNDMm(NDgWuGQUTTsk-q",
  })
    .then(() => {
      console.log("Admin created");
    })
    .catch(() => {
      console.log("Admin already exists");
    });
}

module.exports = seedUsers;
