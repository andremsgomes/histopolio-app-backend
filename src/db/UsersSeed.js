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
  const userHashedPassword = await bcrypt.hash("johndoe123!", userSalt);
  await User.create({
    name: "John Doe",
    email: "johndoe@up.pt",
    password: userHashedPassword,
    avatarUrl: "https://www.linkpicture.com/q/user_21.png",
  })
    .then(() => {
      console.log("User created");
    })
    .catch(() => {
      console.log("User already exists");
    });

  // Create FMUP admin
  const adminFmupSalt = await bcrypt.genSalt(10);
  const adminFmupHashedPassword = await bcrypt.hash("fmup123!", adminFmupSalt);
  await User.create({
    name: "FMUP admin",
    email: "fmup.admin@up.pt",
    password: adminFmupHashedPassword,
    avatarUrl: "https://www.linkpicture.com/q/user_21.png",
    adminToken:
      "dwR+i*}{)tAS11u>,7JT0{oB[3uH1Z:8'v`vcu.U2Uod2-.zd4Q'S|I%=@I%UDo",
  })
    .then(() => {
      console.log("FMUP Admin created");
    })
    .catch(() => {
      console.log("FMUP Admin already exists");
    });
}

module.exports = seedUsers;
