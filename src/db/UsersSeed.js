const User = require("../models/User");

async function seedUsers() {
  // Create admin
  await User.create({
    name: "Admin",
    email: "admin@up.pt",
    password: "admin123!",
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
