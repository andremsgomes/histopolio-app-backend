const Badge = require("../models/Badge");
const Board = require("../models/Board");
const Card = require("../models/Card");
const Question = require("../models/Question");
const Save = require("../models/Save");
const Tile = require("../models/Tile");

async function loadBoard(ws, dataReceived) {
  const board = await Board.findOne({ name: dataReceived.board });
  const tiles = await Tile.find({ boardId: board._id });

  const dataToSend = {
    type: "board",
    board: tiles,
  };

  ws.send(JSON.stringify(dataToSend));
}

async function loadQuestions(ws, dataReceived) {
  const board = await Board.findOne({ name: dataReceived.board });
  const questions = await Question.find({ boardId: board._id });

  const dataToSend = {
    type: "questions",
    questions: questions,
  };

  ws.send(JSON.stringify(dataToSend));
}

async function loadCards(ws, dataReceived) {
  const board = await Board.findOne({ name: dataReceived.board });
  const cards = await Card.find({ boardId: board._id });
  const cardsArray = JSON.parse(JSON.stringify(cards));

  const tiles = await Tile.find({ boardId: board._id });

  for (let i = 0; i < tiles.length; i++) {
    const trainCards = await Card.find({ tileId: tiles[i]._id });
    
    trainCards.forEach((card) => {
      cardsArray.push(card);
    })
  }

  const dataToSend = {
    type: "cards",
    cards: cardsArray,
  };

  ws.send(JSON.stringify(dataToSend));
}

async function loadSaves(ws, dataReceived) {
  const board = await Board.findOne({ name: dataReceived.board });
  const saves = await Save.find({ boardId: board._id });

  const dataToSend = {
    type: "save files",
    files: saves,
  };

  ws.send(JSON.stringify(dataToSend));
}

async function loadBadges(ws, dataReceived) {
  const board = await Board.findOne({ name: dataReceived.board });
  const badges = await Badge.find({ boardId: board._id }).sort("multiplier");

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
