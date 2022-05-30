const bcrypt = require("bcrypt");

const User = require("../models/User");

async function seedUsers() {
  // Create admin
  const adminSalt = await bcrypt.genSalt(10);
  const adminHashedPassword = await bcrypt.hash("admin123!", adminSalt);
  await User.create({
    name: "Admin",
    email: "admin@up.pt",
    password: adminHashedPassword,
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

  // Create user
  const userSalt = await bcrypt.genSalt(10);
  const userHashedPassword = await bcrypt.hash("andre123!", userSalt);
  await User.create({
    name: "André",
    email: "andre@up.pt",
    password: userHashedPassword,
    avatarUrl: "https://www.linkpicture.com/q/user_21.png",
  })
    .then(() => {
      console.log("User created");
    })
    .catch(() => {
      console.log("User already exists");
    });
}

module.exports = seedUsers;
