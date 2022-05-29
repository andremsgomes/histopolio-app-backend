const seedUsers = require("./UsersSeed");
const seedBoards = require("./BoardsSeed");

async function seed() {
  await seedUsers();

  await seedBoards();
}

module.exports = seed;
