const WebSocket = require("ws");
const Badge = require("../models/Badge");
const Board = require("../models/Board");
const Card = require("../models/Card");
const Player = require("../models/Player");
const Question = require("../models/Question");
const Save = require("../models/Save");
const Tile = require("../models/Tile");
const User = require("../models/User");

let gameBoard = "";
let gameSave = "";
let gameStarted = false;
let sessionCode = null;
let unityMessages = [];

async function sendQuestionToFrontend(frontendWS, dataReceived) {
  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataReceived));
  }
}

async function sendGameStatusToFrontend(frontendWS, userId, boardName) {
  const board = await Board.findOne({ name: boardName });
  const saves = await Save.find({ boardId: board._id });
  let save = null;
  let player = null;

  for (let i = 0; i < saves.length; i++) {
    player = await Player.findOne({ userId: userId, saveId: saves[i].id });

    if (player) {
      save = saves[i];
      break;
    }
  }

  if (!player) {
    const dataToSend = {
      type: "redirect back",
    };

    if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
      frontendWS.send(JSON.stringify(dataToSend));
    }

    return;
  }

  playerData = {
    points: player.points,
    position: player.boardPosition,
    badges: player.badges,
  };

  playerData["rank"] = await getRank(userId, boardName, save.name);

  const dataToSend = {
    type: "game status",
    gameStarted:
      gameStarted && boardName === gameBoard && save.name === gameSave,
    playerData: playerData,
    board: boardName,
    save: save.name,
  };

  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataToSend));
  }
}

async function resendGameStatusIfStarted(frontendWSs) {
  if (gameStarted) {
    for (id of frontendWSs.keys()) {
      sendGameStatusToFrontend(frontendWSs.get(id), id, gameBoard);
    }
  }
}

async function getRank(userId, boardName, saveName) {
  const board = await Board.findOne({ name: boardName });
  const save = await Save.findOne({ boardId: board._id, name: saveName });
  const players = await Player.find({ saveId: save._id }).sort({
    points: "descending",
  });

  for (let i = 0; i < players.length; i++) {
    if (players[i].userId == userId) return i + 1;
  }

  return 0;
}

async function setGameReady(frontendWSs) {
  gameStarted = true;

  for (id of frontendWSs.keys()) {
    sendGameStatusToFrontend(frontendWSs.get(id), id, gameBoard);
  }
}

async function sendEndGameToFrontend(frontendWSs) {
  const dataToSend = {
    type: "game status",
    gameStarted: false,
    board: gameBoard,
    save: gameSave,
  };

  for (ws of frontendWSs.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(dataToSend));
  }
}

async function endGame() {
  gameBoard = "";
  gameSave = "";
  sessionCode = null;
  gameStarted = false;
  unityMessages = [];

  console.log("Game ended");
}

function sendPendingMessages(unityWS) {
  while (unityMessages.length > 0) {
    if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
      unityWS.send(unityMessages.shift());
    } else {
      break;
    }
  }
}

async function addPlayerToGame(unityWS, dataReceived) {
  const board = await Board.findOne({ name: gameBoard });
  const save = await Save.findOne({ boardId: board._id, name: gameSave });
  let player = await Player.findOne({
    saveId: save._id,
    userId: dataReceived["userId"],
  });

  let multiplier = 1;
  for (let i = 0; i < player.badges.length; i++) {
    const badge = await Badge.findById(player.badges[i]);

    if (badge && badge.multiplier > multiplier) multiplier = badge.multiplier;
  }

  const dataToSend = {
    type: "join game",
    userId: player.userId,
    name: dataReceived["name"],
    avatar: dataReceived["avatar"],
    points: player.points,
    position: player.boardPosition,
    numTurns: player.turns,
    totalAnswers: player.totalAnswers,
    correctAnswers: player.correctAnswers,
    badges: player.badges,
    multiplier: multiplier,
    finishedBoard: player.finishedBoard,
  };

  if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
    unityWS.send(JSON.stringify(dataToSend));
  } else if (sessionCode !== null) {
    unityMessages.push(JSON.stringify(dataToSend));
  }
}

async function removePlayerFromGame(unityWS, userId) {
  const dataToSend = {
    type: "remove player",
    userId: userId,
  };

  if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
    unityWS.send(JSON.stringify(dataToSend));
  } else if (sessionCode !== null) {
    unityMessages.push(JSON.stringify(dataToSend));
  }
}

async function sendTurnToFrontend(frontendWS) {
  const dataToSend = {
    type: "turn",
  };

  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataToSend));
  }
}

async function sendDiceToFrontend(frontendWS) {
  const dataToSend = {
    type: "dice",
  };

  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataToSend));
  }
}

async function sendDiceResultToUnity(unityWS, dataReceived) {
  // wait for dice to stop rolling
  await new Promise((resolve) => setTimeout(resolve, dataReceived["rollTime"]));

  if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
    unityWS.send(JSON.stringify(dataReceived));
  } else if (sessionCode !== null) {
    unityMessages.push(JSON.stringify(dataReceived));
  }
}

async function sendInfoShownToFrontend(frontendWS, dataReceived) {
  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataReceived));
  }
}

async function loadGame(unityWS, dataReceived) {
  gameBoard = dataReceived["board"];
  gameSave = dataReceived["file"];
  sessionCode = dataReceived["sessionCode"];

  const board = await Board.findOne({ name: gameBoard });
  let save = await Save.findOne({ boardId: board._id, name: gameSave });

  if (!save) {
    save = await Save.create({
      boardId: board._id,
      name: gameSave,
    });
  }

  const players = await Player.find({ saveId: save._id });
  const playersArray = JSON.parse(JSON.stringify(players));

  for (let i = 0; i < playersArray.length; i++) {
    const user = await User.findById(playersArray[i].userId);

    if (user) {
      playersArray[i]["name"] = user.name;
      playersArray[i]["email"] = user.email;
      playersArray[i]["avatar"] = user.avatarUrl;
    }
  }

  const dataToSend = {
    type: "players",
    players: playersArray,
  };

  if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
    unityWS.send(JSON.stringify(dataToSend));
  } else if (sessionCode !== null) {
    unityMessages.push(JSON.stringify(dataToSend));
  }
}

async function saveGame(frontendWSs, dataReceived) {
  const board = await Board.findOne({ name: gameBoard });
  const save = await Save.findOne({ boardId: board._id, name: gameSave });
  const player = await Player.findOne({
    userId: dataReceived["userId"],
    saveId: save._id,
  });

  player.points = dataReceived["points"];
  player.boardPosition = dataReceived["position"];
  player.turns = dataReceived["numTurns"];
  player.totalAnswers = dataReceived["totalAnswers"];
  player.correctAnswers = dataReceived["correctAnswers"];
  player.finishedBoard = dataReceived["finishedBoard"];

  await player.save();

  console.log("Game Saved!");

  sendUpdateToFrontend(frontendWSs, save._id);
}

async function sendUpdateToFrontend(frontendWSs, saveId) {
  const players = await Player.find({ saveId: saveId }).sort({
    points: "descending",
  });

  let rank = 1;

  players.forEach((player) => {
    const dataToSend = {
      type: "update",
      points: player.points,
      position: player.boardPosition,
      rank: rank++,
    };

    ws = frontendWSs.get(player.userId.toString());

    if (ws && ws.readyState === WebSocket.OPEN)
      ws.send(JSON.stringify(dataToSend));
  });
}

async function sendFinishTurnToFrontend(frontendWS, dataReceived) {
  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataReceived));
  }
}

async function sendDataToUnity(unityWS, dataReceived) {
  if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
    unityWS.send(JSON.stringify(dataReceived));
  } else if (sessionCode !== null) {
    unityMessages.push(JSON.stringify(dataReceived));
  }
}

async function sendContentToFrontend(frontendWS, dataReceived) {
  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataReceived));
  }
}

async function updatePlayerBadges(unityWS, frontendWSs, dataReceived) {
  const badge = await Badge.findById(dataReceived.badgeId);
  const board = await Board.findOne({ name: dataReceived.board });
  const save = await Save.findOne({
    boardId: board._id,
    name: dataReceived.save,
  });
  const player = await Player.findOne({
    userId: dataReceived.userId,
    saveId: save._id,
  });

  player.badges.push(badge._id);
  player.points -= badge.cost;
  await player.save();

  let multiplier = 1;
  for (let i = 0; i < player.badges.length; i++) {
    const badge = await Badge.findById(player.badges[i]);

    if (badge && badge.multiplier > multiplier) multiplier = badge.multiplier;
  }

  dataToSend = {
    type: "new badge",
    userId: dataReceived.userId,
    badgeId: dataReceived.badgeId,
    points: player.points,
    multiplier: multiplier,
  };

  if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
    unityWS.send(JSON.stringify(dataToSend));
  } else if (sessionCode !== null) {
    unityMessages.push(JSON.stringify(dataToSend));
  }

  sendUpdateToFrontend(frontendWSs, save._id);
}

async function getPlayerSavedData(req, res) {
  const boardName = req.params.board;
  const userId = req.params.user_id;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .json({ error: true, message: "Tabuleiro não encontrado" });
  }

  const saves = await Save.find({ boardId: board._id });
  const playerSaves = [];

  for (let i = 0; i < saves.length; i++) {
    const player = await Player.findOne({
      userId: userId,
      saveId: saves[i]._id,
    });

    if (player) {
      const playerArray = JSON.parse(JSON.stringify(player));
      playerArray["saveName"] = saves[i].name;
      playerSaves.push(playerArray);
    }
  }

  return res.status(200).json(playerSaves);
}

async function getPlayers(req, res) {
  const boardName = req.params.board;
  const saveName = req.params.save;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .json({ error: true, message: "Tabuleiro não encontrado" });
  }

  const save = await Save.findOne({ name: saveName });

  if (!save) {
    return res
      .status(404)
      .json({ error: true, message: "Ficheiro não encontrado" });
  }

  const players = await Player.find({ saveId: save._id });
  const playersArray = JSON.parse(JSON.stringify(players));

  for (let i = 0; i < playersArray.length; i++) {
    const user = await User.findById(playersArray[i].userId);

    if (user) {
      playersArray[i].name = user.name;
      playersArray[i].email = user.email;
    }
  }

  return res.status(200).json(playersArray);
}

async function updatePlayers(req, res) {
  const { players } = req.body;

  for (let i = 0; i < players.length; i++) {
    try {
      await Player.findByIdAndUpdate(players[i]._id, players[i], {
        upsert: true,
      });
    } catch (error) {
      return res.status(400).json({ error: true, message: error });
    }
  }

  return res.status(200).send();
}

async function getSaves(req, res) {
  const boardName = req.params.board;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .json({ error: true, message: "Tabuleiro não encontrado" });
  }

  const saves = await Save.find({ boardId: board._id });
  const savesArray = JSON.parse(JSON.stringify(saves));

  for (let i = 0; i < savesArray.length; i++) {
    savesArray[i].players = (
      await Player.find({ saveId: savesArray[i]._id })
    ).length;
  }

  return res.status(200).json(savesArray);
}

async function getBoards(_, res) {
  const boards = await Board.find();

  return res.status(200).json(boards);
}

async function getAdminBoards(req, res) {
  const adminId = req.params.admin;
  const boards = await Board.find({ adminId: adminId });

  return res.status(200).json(boards);
}

async function getBoard(req, res) {
  const boardName = req.params.board;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .json({ error: true, message: "Tabuleiro não encontrado" });
  }

  const data = {
    name: board.name,
    description: board.description,
    image: board.image,
  };

  const tiles = await Tile.find({ boardId: board._id }).sort("boardPosition");
  const tilesArray = JSON.parse(JSON.stringify(tiles));

  for (let i = 0; i < tilesArray.length; i++) {
    if (
      tilesArray[i].type === "groupProperty" ||
      tilesArray[i].type === "pay"
    ) {
      tilesArray[i].questions = (
        await Question.find({ tileId: tilesArray[i]._id })
      ).length;
    } else if (tilesArray[i].type === "community") {
      tilesArray[i].cards = (
        await Card.find({
          type: "deck",
          subtype: "community",
          boardId: board._id,
        })
      ).length;
    } else if (tilesArray[i].type === "chance") {
      tilesArray[i].cards = (
        await Card.find({ type: "deck", subtype: "chance", boardId: board._id })
      ).length;
    } else if (tilesArray[i].type === "train") {
      tilesArray[i].cards = (
        await Card.find({ type: "train", tileId: tilesArray[i]._id })
      ).length;
    }
  }

  data["tiles"] = tilesArray;

  return res.status(200).json(data);
}

async function updateBoard(req, res) {
  const { boardName, name, description, image } = req.body;

  if (!boardName) {
    return res
      .status(400)
      .send({ error: true, message: "Dados mal formatados" });
  }

  const board = await Board.findOne({name: boardName});

  if (!board) {
    return res
      .status(404)
      .json({ error: true, message: "Tabuleiro não encontrado" });
  }

  if (name && name !== board.name) {
    const newBoard = await Board.findOne({ name: name });

    if (newBoard) {
      return res.status(400).json({
        error: true,
        message: "Já existe um tabuleiro com o nome dado",
      });
    }

    board.name = name;
  }

  if (description) {
    board.description = description;
  }

  if (image) {
    board.image = image;
  }

  await board.save();

  return res.status(200).send();
}

async function updateTiles(req, res) {
  const { tiles } = req.body;

  if (!tiles) {
    return res
      .status(400)
      .send({ error: true, message: "Dados mal formatados" });
  }

  for (let i = 0; i < tiles.length; i++) {
    try {
      await Tile.findByIdAndUpdate(tiles[i]._id, tiles[i], { upsert: true });
    } catch (error) {
      return res.status(400).json({ error: true, message: error });
    }
  }

  return res.status(200).send();
}

async function getQuestions(req, res) {
  const boardName = req.params.board;
  const boardPosition = parseInt(req.params.tile);

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .send({ error: true, message: "Tabuleiro não encontrado" });
  }

  const tile = await Tile.findOne({
    boardId: board._id,
    boardPosition: boardPosition,
  });

  if (!tile) {
    return res
      .status(404)
      .send({ error: true, message: "Casa não encontrada" });
  }

  const questions = await Question.find({ tileId: tile._id });

  return res.status(200).json(questions);
}

async function getQuestion(req, res) {
  const id = req.params.id;
  const question = await Question.findById(id);

  return res.status(200).json(question);
}

async function newQuestion(req, res) {
  const {
    boardName,
    boardPosition,
    question,
    image,
    answers,
    correctAnswer,
  } = req.body;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .send({ error: true, message: "Tabuleiro não encontrado" });
  }

  const tile = await Tile.findOne({
    boardId: board._id,
    boardPosition: boardPosition,
  });

  if (!tile) {
    return res
      .status(404)
      .send({ error: true, message: "Casa não encontrada" });
  }

  Question.create({
    tileId: tile._id,
    question: question,
    image: image,
    answers: answers,
    correctAnswer: correctAnswer,
  })
    .then(() => {
      return res.status(201).send();
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).send({ error: true, message: error });
    });
}

async function updateQuestion(req, res) {
  const { id, question, image, answers, correctAnswer } = req.body;

  const questionObject = await Question.findById(id);

  if (!questionObject) {
    return res
      .status(404)
      .send({ error: true, message: "Pergunta não encontrada" });
  }

  questionObject.question = question;
  questionObject.image = image;
  questionObject.answers = answers;
  questionObject.correctAnswer = correctAnswer;

  await questionObject.save();

  return res.status(200).send();
}

async function deleteQuestion(req, res) {
  const id = req.params.id;

  await Question.deleteOne({ _id: id }).catch((error) => {
    console.log(error);
    return res.status(400).send({ error: true, message: "Erro interno" });
  });

  return res.status(200).send();
}

async function getDeckCards(req, res) {
  const boardName = req.params.board;
  const deck = req.params.deck;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .send({ error: true, message: "Tabuleiro não encontrado" });
  }

  const cards = await Card.find({
    boardId: board._id,
    type: "deck",
    subtype: deck,
  });

  return res.status(200).json(cards);
}

async function newDeckCard(req, res) {
  const { boardName, deck, info, points, action, actionValue } = req.body;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .send({ error: true, message: "Tabuleiro não encontrado" });
  }

  await Card.create({
    type: "deck",
    subtype: deck,
    boardId: board._id,
    points: points,
    action: action,
    actionValue: actionValue,
    info: info,
  }).catch((error) => {
    console.log(error);
    return res.status(400).send({ error: true, message: error });
  });

  return res.status(201).send();
}

async function updateDeckCard(req, res) {
  const { id, deck, info, points, action, actionValue } = req.body;

  const card = await Card.findById(id);

  if (!card) {
    return res
      .status(404)
      .send({ error: true, message: "Carta não encontrada" });
  }

  card.subtype = deck;
  card.info = info;
  card.points = points;
  card.action = action;
  card.actionValue = actionValue;

  await card.save();

  return res.status(200).send();
}

async function getTrainCards(req, res) {
  const boardName = req.params.board;
  const boardPosition = parseInt(req.params.tile);

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .send({ error: true, message: "Tabuleiro não encontrado" });
  }

  const tile = await Tile.findOne({
    boardId: board._id,
    boardPosition: boardPosition,
  });

  if (!tile) {
    return res
      .status(404)
      .send({ error: true, message: "Casa não encontrada" });
  }

  const cards = await Card.find({ type: "train", tileId: tile._id });

  return res.status(200).json(cards);
}

async function newTrainCard(req, res) {
  const { boardName, boardPosition, info, content } = req.body;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .send({ error: true, message: "Tabuleiro não encontrado" });
  }

  const tile = await Tile.findOne({
    boardId: board._id,
    boardPosition: boardPosition,
  });

  if (!tile) {
    return res
      .status(404)
      .send({ error: true, message: "Casa não encontrada" });
  }

  await Card.create({
    type: "train",
    tileId: tile._id,
    info: info,
    content: content,
  }).catch((error) => {
    console.log(error);
    return res.status(400).send({ error: true, message: error });
  });

  return res.status(201).send();
}

async function updateTrainCard(req, res) {
  const { id, info, content } = req.body;

  const card = await Card.findById(id);

  if (!card) {
    return res
      .status(404)
      .send({ error: true, message: "Carta não encontrada" });
  }

  card.info = info;
  card.content = content;

  await card.save();

  return res.status(200).send();
}

async function getCard(req, res) {
  const id = req.params.id;
  const card = await Card.findById(id);

  return res.status(200).json(card);
}

async function deleteCard(req, res) {
  const id = req.params.id;

  await Card.deleteOne({ _id: id }).catch((error) => {
    console.log(error);
    return res.status(400).send({ error: true, message: "Erro interno" });
  });

  return res.status(200).send();
}

async function getBadges(req, res) {
  const boardName = req.params.board;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .send({ error: true, message: "Tabuleiro não encontrado" });
  }

  const badges = await Badge.find({ boardId: board._id }).sort("multiplier");

  return res.status(200).json(badges);
}

async function getBadge(req, res) {
  const id = req.params.id;
  const badge = await Badge.findById(id);

  return res.status(200).json(badge);
}

async function newBadge(req, res) {
  const { boardName, name, image, multiplier, cost } = req.body;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .send({ error: true, message: "Tabuleiro não encontrado" });
  }

  await Badge.create({
    boardId: board._id,
    name: name,
    multiplier: multiplier,
    cost: cost,
    image: image,
  }).catch(() => {
    return res
      .status(400)
      .send({ error: true, message: "Já existe um troféu com o mesmo nome" });
  });

  return res.status(201).send();
}

async function updateBadge(req, res) {
  const { id, name, image, multiplier, cost } = req.body;

  const badge = await Badge.findById(id);

  badge.name = name;
  badge.image = image;
  badge.multiplier = multiplier;
  badge.cost = cost;

  await badge.save();

  return res.status(200).send();
}

async function deleteBadge(req, res) {
  const id = req.params.id;

  await Badge.deleteOne({ _id: id }).catch((error) => {
    console.log(error);
    return res.status(400).send({ error: true, message: "Erro interno" });
  });

  return res.status(200).send();
}

async function getPlayer(req, res) {
  const boardName = req.params.board;
  const userId = req.params.user_id;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .send({ error: true, message: "Tabuleiro não encontrado" });
  }

  const saves = await Save.find({ boardId: board._id });

  for (let i = 0; i < saves.length; i++) {
    const player = await Player.findOne({
      userId: userId,
      saveId: saves[i]._id,
    });

    if (player) {
      return res.status(200).json(player);
    }
  }

  return res
    .status(404)
    .send({ error: true, message: "Sem dados guardados para o utilizador" });
}

async function createPlayer(req, res) {
  if (gameBoard === "" || gameSave === "" || sessionCode === null) {
    return res.status(404).send({
      error: true,
      message: "Nenhuma sessão se encontra ativa neste momento",
    });
  }

  const { userId, boardName, code } = req.body;

  if (boardName !== gameBoard) {
    return res.status(404).send({
      error: true,
      message: "Nenhuma sessão encontrada para o tabuleiro",
    });
  }

  if (code !== sessionCode) {
    return res.status(404).send({
      error: true,
      message: "Nenhuma sessão encontrada com o código dado",
    });
  }

  const board = await Board.findOne({ name: boardName });
  const save = await Save.findOne({ boardId: board._id, name: gameSave });
  const player = await Player.findOne({ userId: userId, saveId: save._id });

  if (player) {
    return res.status(403).send({
      error: true,
      message: "O utilizador já se encontra registado no tabuleiro",
    });
  }

  await Player.create({
    userId: userId,
    saveId: save._id,
    points: 20,
    boardPosition: 0,
    turns: 0,
    totalAnswers: 0,
    correctAnswers: 0,
    badges: [],
    finishedBoard: false,
  });

  return res.status(201).send();
}

module.exports = {
  sendQuestionToFrontend,
  addPlayerToGame,
  removePlayerFromGame,
  sendGameStatusToFrontend,
  resendGameStatusIfStarted,
  setGameReady,
  sendEndGameToFrontend,
  endGame,
  sendPendingMessages,
  sendTurnToFrontend,
  sendDiceToFrontend,
  sendDiceResultToUnity,
  sendInfoShownToFrontend,
  loadGame,
  saveGame,
  sendFinishTurnToFrontend,
  sendDataToUnity,
  sendContentToFrontend,
  updatePlayerBadges,
  getPlayerSavedData,
  getPlayers,
  updatePlayers,
  getSaves,
  getBoards,
  getAdminBoards,
  getBoard,
  updateBoard,
  updateTiles,
  getQuestions,
  getQuestion,
  newQuestion,
  updateQuestion,
  deleteQuestion,
  getDeckCards,
  newDeckCard,
  updateDeckCard,
  getTrainCards,
  newTrainCard,
  updateTrainCard,
  getCard,
  deleteCard,
  getBadges,
  getBadge,
  newBadge,
  updateBadge,
  deleteBadge,
  getPlayer,
  createPlayer,
};
