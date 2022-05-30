const Save = require("../models/Save");
const User = require("../models/User");
const Player = require("../models/Player");
const e = require("express");

async function seedSaves(boardId) {
  // Add all saves
  const save = await Save.create({
    boardId: boardId,
    name: "Turma 1",
  }).catch((error) => {
    console.log(error);
  });

  if (save) {
    await seedPlayers(save._id);
  }

  console.log("Added all saves");
}

async function seedPlayers(saveId) {
  // Add all players
  const user = await User.findOne({ email: "andre@up.pt" });

  if (user) {
    await Player.create({
      userId: user._id,
      saveId: saveId,
      points: 20,
      boardPosition: 0,
      turns: 0,
      totalAnswers: 0,
      correctAnswers: 0,
      badges: [],
      finishedBoard: false,
    }).catch((error) => {
      console.log(error);
    });
  }
}

module.exports = seedSaves;
