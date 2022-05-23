const { readJSONFile, getFilesFromDir } = require("../utils/file-utils");

async function loadBoard(ws, dataReceived) {
  const board = readJSONFile(
    "./data/" + dataReceived.board + "/BoardData.json"
  );

  const dataToSend = {
    type: "board",
    board: board,
  };

  ws.send(JSON.stringify(dataToSend));
}

async function loadQuestions(ws, dataReceived) {
  const questions = readJSONFile(
    "./data/" + dataReceived.board + "/Questions.json"
  );

  const dataToSend = {
    type: "questions",
    questions: questions,
  };

  ws.send(JSON.stringify(dataToSend));
}

async function loadCards(ws, dataReceived) {
  const cards = readJSONFile("./data/" + dataReceived.board + "/Cards.json");

  const dataToSend = {
    type: "cards",
    cards: cards,
  };

  ws.send(JSON.stringify(dataToSend));
}

async function loadSaves(ws, dataReceived) {
  const saveFiles = getFilesFromDir(`./data/${dataReceived.board}/saves/`);

  const dataToSend = {
    type: "save files",
    files: saveFiles,
  };

  ws.send(JSON.stringify(dataToSend));
}

async function loadBadges(ws, dataReceived) {
  const badges = readJSONFile(`./data/${dataReceived.board}/Badges.json`);
  badges.sort((a, b) => a.multiplier - b.multiplier);

  const dataToSend = {
    type: "badges",
    badges: badges,
  };

  ws.send(JSON.stringify(dataToSend));
}

module.exports = {
  loadBoard,
  loadQuestions,
  loadCards,
  loadSaves,
  loadBadges,
};
