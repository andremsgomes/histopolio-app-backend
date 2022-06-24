const WebSocket = require("ws");
const Badge = require("../models/Badge");
const Board = require("../models/Board");
const Card = require("../models/Card");
const Question = require("../models/Question");
const Save = require("../models/Save");
const Tile = require("../models/Tile");
const User = require("../models/User");

const bcrypt = require("bcrypt");

let boardGameMessages = new Map();

async function loadBoard(ws, dataReceived) {
  const board = await Board.findOne({ name: dataReceived.board });
  const tiles = await Tile.find({ boardId: board._id });

  const dataToSend = {
    type: "board",
    board: tiles,
  };

  if (ws != null && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(dataToSend));
  } else {
    boardGameMessages.get(dataReceived["adminId"]).push(JSON.stringify(dataToSend));
  }
}

async function loadQuestions(ws, dataReceived) {
  const board = await Board.findOne({ name: dataReceived.board });
  const tiles = await Tile.find({ boardId: board._id });
  const questions = [];

  for (let i = 0; i < tiles.length; i++) {
    const tileQuestions = await Question.find({ tileId: tiles[i]._id });
    
    tileQuestions.forEach((question) => {
      questions.push(question);
    });
  }

  const dataToSend = {
    type: "questions",
    questions: questions,
  };

  if (ws != null && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(dataToSend));
  } else {
    boardGameMessages.get(dataReceived["adminId"]).push(JSON.stringify(dataToSend));
  }
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
    });
  }

  const dataToSend = {
    type: "cards",
    cards: cardsArray,
  };

  if (ws != null && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(dataToSend));
  } else {
    boardGameMessages.get(dataReceived["adminId"]).push(JSON.stringify(dataToSend));
  }
}

async function loadSaves(ws, dataReceived) {
  const board = await Board.findOne({ name: dataReceived.board });
  const saves = await Save.find({ boardId: board._id });

  const dataToSend = {
    type: "save files",
    files: saves,
  };

  if (ws != null && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(dataToSend));
  } else {
    boardGameMessages.get(dataReceived["adminId"]).push(JSON.stringify(dataToSend));
  }
}

async function loadBadges(ws, dataReceived) {
  const board = await Board.findOne({ name: dataReceived.board });
  const badges = await Badge.find({ boardId: board._id }).sort("multiplier");

  const dataToSend = {
    type: "badges",
    badges: badges,
  };

  if (ws != null && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(dataToSend));
  } else {
    boardGameMessages.get(dataReceived["adminId"]).push(JSON.stringify(dataToSend));
  }
}

function sendPendingMessages(adminId, ws) {
  if (!boardGameMessages.get(adminId)) {
    boardGameMessages.set(adminId, []);
  }

  while (boardGameMessages.get(adminId).length > 0) {
    if (ws != null && ws.readyState === WebSocket.OPEN) {
      ws.send(boardGameMessages.get(adminId).shift());
    } else {
      break;
    }
  }
}

function deletePendingMessages(adminId) {
  boardGameMessages.delete(adminId);
}

async function login(ws, dataReceived) {
  if (!(dataReceived["email"] && dataReceived["password"])) return;

  const user = await User.findOne({ email: dataReceived["email"] });

  if (!user) return;

  if (!(await bcrypt.compare(dataReceived["password"], user.password))) return;

  if (!user.adminToken) return;

  const boards = await Board.find({ adminId: user._id });
  const boardNames = [];

  boards.forEach((board) => {
    boardNames.push(board.name);
  });

  const dataToSend = {
    type: "auth",
    adminId: user._id,
    boards: boardNames,
  };

  if (ws != null && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(dataToSend));
  } else {
    boardGameMessages.get(user._id).push(JSON.stringify(dataToSend));
  }

  return user._id
}

module.exports = {
  loadBoard,
  loadQuestions,
  loadCards,
  loadSaves,
  loadBadges,
  sendPendingMessages,
  deletePendingMessages,
  login,
};
