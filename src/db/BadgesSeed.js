const Badge = require("../models/Badge");

async function seedBadges(boardId) {
  // Add all badges
  await Badge.create({
    boardId: boardId,
    name: "Microscópio ótico",
    multiplier: 2,
    cost: 50,
    image: "https://www.linkpicture.com/q/trofeu50.png",
  }).catch((error) => {
    console.log(error);
  });

  await Badge.create({
    boardId: boardId,
    name: "Microscópio eletrónico",
    multiplier: 3,
    cost: 90,
    image: "https://www.linkpicture.com/q/trofeu90.png",
  }).catch((error) => {
    console.log(error);
  });

  console.log("Added all badges");
}

module.exports = seedBadges;
