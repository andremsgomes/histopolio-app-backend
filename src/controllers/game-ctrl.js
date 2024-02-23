const WebSocket = require("ws");
const Badge = require("../models/Badge");
const Board = require("../models/Board");
const Card = require("../models/Card");
const Player = require("../models/Player");
const Question = require("../models/Question");
const Save = require("../models/Save");
const Tile = require("../models/Tile");
const User = require("../models/User");

let boardGameMessages = new Map();
let gameSaves = new Map();
let sessionCodes = new Map();
let gamesStarted = new Set();
let playerSessions = new Map();

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

  let adminId = null;
  for (id of gameSaves.keys()) {
    if (gameSaves.get(id).toString() === save._id.toString()) {
      adminId = id;
    }
  }

  const gameStarted = adminId && gamesStarted.has(adminId);

  const dataToSend = {
    type: "game status",
    gameStarted: gameStarted,
    playerData: playerData,
    board: boardName,
    save: save.name,
    adminId: adminId,
  };

  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataToSend));
  }
}

async function resendGameStatusIfStarted(adminId, frontendWSs) {
  if (gamesStarted.has(adminId)) {
    for (id of frontendWSs.keys()) {
      const save = await Save.findById(gameSaves.get(adminId));
      const board = await Board.findById(save.boardId);

      sendGameStatusToFrontend(frontendWSs.get(id), id, board.name);
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

async function setGameReady(frontendWSs, dataReceived) {
  gamesStarted.add(dataReceived["adminId"]);

  const save = await Save.findById(gameSaves.get(dataReceived["adminId"]));
  const board = await Board.findById(save.boardId);

  for (id of frontendWSs.keys()) {
    sendGameStatusToFrontend(frontendWSs.get(id), id, board.name);
  }
}

async function sendEndGameToFrontend(adminId, frontendWSs) {
  const save = await Save.findById(gameSaves.get(adminId));
  const board = await Board.findById(save.boardId);

  const dataToSend = {
    type: "game status",
    gameStarted: false,
    board: board.name,
    save: save.name,
  };

  for (ws of frontendWSs.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(dataToSend));
  }
}

async function endGame(adminId) {
  gameSaves.delete(adminId);
  gamesStarted.delete(adminId);
  boardGameMessages.delete(adminId);

  for (code of sessionCodes.keys()) {
    if (sessionCodes.get(code).toString() === adminId.toString()) {
      sessionCodes.delete(code);
      break;
    }
  }

  for (userId of playerSessions.keys()) {
    if (playerSessions.get(userId).toString() === adminId.toString()) {
      playerSessions.delete(userId);
    }
  }

  console.log("Game ended");
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

async function addPlayerToGame(unityWS, dataReceived) {
  playerSessions.set(dataReceived["userId"], dataReceived["adminId"]);

  const save = await Save.findById(gameSaves.get(dataReceived["adminId"]));
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
  } else if (gamesStarted.has(dataReceived["adminId"])) {
    boardGameMessages
      .get(dataReceived["adminId"])
      .push(JSON.stringify(dataToSend));
  }
}

async function removePlayerFromGame(boardGameWSs, userId) {
  const adminId = playerSessions.get(userId);
  const ws = boardGameWSs.get(adminId);
  playerSessions.delete(userId);

  const dataToSend = {
    type: "remove player",
    userId: userId,
  };

  if (ws != null && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(dataToSend));
  } else if (gamesStarted.has(adminId)) {
    boardGameMessages.get(adminId).push(JSON.stringify(dataToSend));
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
  } else if (gamesStarted.has(dataReceived["adminId"])) {
    boardGameMessages
      .get(dataReceived["adminId"])
      .push(JSON.stringify(dataReceived));
  }
}

async function sendInfoShownToFrontend(frontendWS, dataReceived) {
  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataReceived));
  }
}

async function loadGame(unityWS, dataReceived) {
  let sessionCode = Math.floor(Math.random() * 9000) + 1000;

  while (sessionCodes.get(sessionCode)) {
    sessionCode = Math.floor(Math.random() * 9000) + 1000;
  }

  sessionCodes.set(sessionCode, dataReceived["adminId"]);

  const board = await Board.findOne({ name: dataReceived["board"] });
  let save = await Save.findOne({
    boardId: board._id,
    name: dataReceived["file"],
  });

  if (!save) {
    save = await Save.create({
      boardId: board._id,
      name: dataReceived["file"],
    });
  }

  gameSaves.set(dataReceived["adminId"], save._id);

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
    type: "session",
    players: playersArray,
    sessionCode: sessionCode,
  };

  if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
    unityWS.send(JSON.stringify(dataToSend));
  } else if (gamesStarted.has(dataReceived["adminId"])) {
    boardGameMessages
      .get(dataReceived["adminId"])
      .push(JSON.stringify(dataToSend));
  }
}

async function saveGame(frontendWSs, dataReceived) {
  const save = await Save.findById(gameSaves.get(dataReceived["adminId"]));
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
  } else if (gamesStarted.has(dataReceived["adminId"])) {
    boardGameMessages
      .get(dataReceived["adminId"])
      .push(JSON.stringify(dataReceived));
  }
}

async function sendContentToFrontend(frontendWS, dataReceived) {
  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataReceived));
  }
}

async function updatePlayerBadges(boardGameWSs, frontendWSs, dataReceived) {
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

  const adminId = playerSessions.get(dataReceived.userId);

  let ws = null;
  if (adminId) {
    ws = boardGameWSs.get(adminId);
  }

  if (ws != null && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(dataToSend));
  } else if (gamesStarted.has(adminId)) {
    boardGameMessages.get(adminId).push(JSON.stringify(dataToSend));
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

async function deleteSave(req, res) {
  const id = req.params.id;

  const save = await Save.findById(id);

  if (!save) {
    return res
      .status(404)
      .json({ error: true, message: "Dados guardados não encontrados" });
  }

  await Player.deleteMany({ saveId: save._id });
  await Save.deleteOne({ _id: save._id });

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

async function newBoard(req, res) {
  const { userId, name, description, image } = req.body;

  if (!(userId && name && description && image)) {
    return res
      .status(400)
      .send({ error: true, message: "Dados mal formatados" });
  }

  const board = await Board.create({
    adminId: userId,
    name: name,
    description: description,
    image: image,
  }).catch(() => {
    return res.status(400).json({
      error: true,
      message: "Tabuleiro com o mesmo nome já existente",
    });
  });

  await addTiles(board._id);

  return res.status(201).send();
}

async function addTiles(boardId) {
  // Add all tiles
  await Tile.create({
    boardId: boardId,
    boardPosition: 0,
    name: "Partida",
    type: "go",
    position: {
      x: 9.300000190734863,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 20,
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 1,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 8,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
    points: 10,
    groupColor: {
      r: 1,
      g: 0.8500000238418579,
      b: 0.7200000286102295,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 2,
    name: "Decisões Do Senado",
    type: "community",
    position: {
      x: 7,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 3,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 6,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
    points: 20,
    groupColor: {
      r: 1,
      g: 0.8500000238418579,
      b: 0.7200000286102295,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 4,
    name: "Pague Seguro Escolar",
    type: "pay",
    position: {
      x: 5,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
    points: -10,
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 5,
    name: "Casa sem nome",
    type: "train",
    position: {
      x: 4,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
    points: 20,
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 6,
    name: "Sorte",
    type: "chance",
    position: {
      x: 3,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 7,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 2,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
    points: 15,
    groupColor: {
      r: 1,
      g: 0.8500000238418579,
      b: 0.7200000286102295,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 8,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 1,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
    points: 20,
    groupColor: {
      r: 1,
      g: 0.8500000238418579,
      b: 0.7200000286102295,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 9,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
    points: 15,
    groupColor: {
      r: 1,
      g: 0.8500000238418579,
      b: 0.7200000286102295,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 10,
    name: "Passagem Pela Biblioteca",
    type: "prison",
    position: {
      x: -1.2999999523162842,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 11,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: -1.2999999523162842,
      y: 1.2999999523162842,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 20,
    groupColor: {
      r: 0.4699999988079071,
      g: 0.6299999952316284,
      b: 0.8399999737739563,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 12,
    name: "Pague Prestação Propinas",
    type: "pay",
    position: {
      x: -1.2999999523162842,
      y: 2.299999952316284,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: -10,
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 13,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: -1.2999999523162842,
      y: 3.299999952316284,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 15,
    groupColor: {
      r: 0.4699999988079071,
      g: 0.6299999952316284,
      b: 0.8399999737739563,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 14,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: -1.2999999523162842,
      y: 4.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 15,
    groupColor: {
      r: 0.4699999988079071,
      g: 0.6299999952316284,
      b: 0.8399999737739563,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 15,
    name: "Casa sem nome",
    type: "train",
    position: {
      x: -1.2999999523162842,
      y: 5.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 20,
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 16,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: -1.2999999523162842,
      y: 6.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 20,
    groupColor: {
      r: 0.4699999988079071,
      g: 0.6299999952316284,
      b: 0.8399999737739563,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 17,
    name: "Decisões Do Senado",
    type: "community",
    position: {
      x: -1.2999999523162842,
      y: 7.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.7071068286895752,
      w: 0.7071068286895752,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 18,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: -1.2999999523162842,
      y: 8.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 20,
    groupColor: {
      r: 0.4699999988079071,
      g: 0.6299999952316284,
      b: 0.8399999737739563,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 19,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: -1.2999999523162842,
      y: 9.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 15,
    groupColor: {
      r: 0.4699999988079071,
      g: 0.6299999952316284,
      b: 0.8399999737739563,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 20,
    name: "Associação De Estudantes",
    type: "parking",
    position: {
      x: -1.2999999523162842,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: -0.7071068286895752,
      w: 0.7071068286895752,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 21,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 0,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 1,
      w: -4.371138828673793e-8,
    },
    points: 20,
    groupColor: {
      r: 0.4699999988079071,
      g: 0.6299999952316284,
      b: 0.8399999737739563,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 22,
    name: "Sorte",
    type: "chance",
    position: {
      x: 1,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 1,
      w: -4.371138828673793e-8,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 23,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 2,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 1,
      w: -4.371138828673793e-8,
    },
    points: 20,
    groupColor: {
      r: 0.4699999988079071,
      g: 0.6299999952316284,
      b: 0.8399999737739563,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 24,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 3,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 1,
      w: -4.371138828673793e-8,
    },
    points: 15,
    groupColor: {
      r: 1,
      g: 0,
      b: 0,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 25,
    name: "Casa sem nome",
    type: "train",
    position: {
      x: 4,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 1,
      w: -4.371138828673793e-8,
    },
    points: 20,
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 26,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 5,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 1,
      w: -4.371138828673793e-8,
    },
    points: 20,
    groupColor: {
      r: 1,
      g: 0,
      b: 0,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 27,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 6,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 1,
      w: -4.371138828673793e-8,
    },
    points: 15,
    groupColor: {
      r: 1,
      g: 0,
      b: 0,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 28,
    name: "Pague Prestação Propinas",
    type: "pay",
    position: {
      x: 7,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 1,
      w: -4.371138828673793e-8,
    },
    points: -15,
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 29,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 8,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 1,
      w: -4.371138828673793e-8,
    },
    points: 20,
    groupColor: {
      r: 1,
      g: 0,
      b: 0,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 30,
    name: "Vá Para A Biblioteca",
    type: "goToPrison",
    position: {
      x: 9.300000190734863,
      y: 10.600000381469727,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 1,
      w: -4.371138828673793e-8,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 31,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 9.300000190734863,
      y: 9.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 20,
    groupColor: {
      r: 0.3700000047683716,
      g: 0.44999998807907104,
      b: 0.23000000417232513,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 32,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 9.300000190734863,
      y: 8.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 20,
    groupColor: {
      r: 0.3700000047683716,
      g: 0.44999998807907104,
      b: 0.23000000417232513,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 33,
    name: "Decisões Do Senado",
    type: "community",
    position: {
      x: 9.300000190734863,
      y: 7.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0.7071068286895752,
      w: 0.7071068286895752,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 34,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 9.300000190734863,
      y: 6.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 20,
    groupColor: {
      r: 0.3700000047683716,
      g: 0.44999998807907104,
      b: 0.23000000417232513,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 35,
    name: "Casa sem nome",
    type: "train",
    position: {
      x: 9.300000190734863,
      y: 5.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 20,
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 36,
    name: "Sorte",
    type: "chance",
    position: {
      x: 9.300000190734863,
      y: 4.300000190734863,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0.7071068286895752,
      w: 0.7071068286895752,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 37,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 9.300000190734863,
      y: 3.3000001907348633,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 15,
    groupColor: {
      r: 0.3700000047683716,
      g: 0.44999998807907104,
      b: 0.23000000417232513,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 38,
    name: "Pague Prestação Propinas",
    type: "pay",
    position: {
      x: 9.300000190734863,
      y: 2.3000001907348633,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: -10,
  }).catch((error) => {
    console.log(error);
  });

  await Tile.create({
    boardId: boardId,
    boardPosition: 39,
    name: "Casa sem nome",
    type: "groupProperty",
    position: {
      x: 9.300000190734863,
      y: 1.3000001907348633,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0.7071068286895752,
      w: 0.7071068286895752,
    },
    points: 15,
    groupColor: {
      r: 0.3700000047683716,
      g: 0.44999998807907104,
      b: 0.23000000417232513,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });
}

async function importBoard(req, res) {
  const { userId, boardId } = req.body;

  if (!(userId && boardId)) {
    return res
      .status(400)
      .send({ error: true, message: "Dados mal formatados" });
  }

  const result = await duplicateBoard(boardId);

  if (result.error) {
    return res
      .status(result.status)
      .send({ error: true, message: result.message });
  }

  return res.status(result.status).send({ message: result.message });
}

async function duplicateBoard(userId, boardId) {
  const user = await User.findById(userId);

  if (!user)
    return { error: true, status: 404, message: "Utilizador não encontrado" };
  if (!user.adminToken)
    return {
      error: true,
      status: 403,
      message: "O utilizador não tem permissões para criar novos tabuleiros",
    };

  // Duplicate board
  const board = await Board.findById(boardId);

  if (!board)
    return { error: true, status: 404, message: "Tabuleiro não encontrado" };

  const newBoard = await Board.create({
    adminId: userId,
    name: board.name + " (copy)",
    description: board.description,
    image: board.image,
  }).catch(() => {
    return {
      error: true,
      status: 400,
      message: "Tabuleiro com o mesmo nome já existente",
    };
  });

  // Duplicate tiles
  const tiles = await Tile.find({ boardId: board._id }).sort("boardPosition");

  for (let i = 0; i < tiles.length; i++) {
    const result = await duplicateTile(tiles[i], newBoard._id);

    if (result.error)
      return { error: true, status: result.status, message: result.message };
  }

  // Duplicate cards
  const cards = await Card.find({ boardId: board._id });

  for (let i = 0; i < cards.length; i++) {
    const result = await duplicateCard(cards[i], newBoard._id, "board");

    if (result.error)
      return { error: true, status: result.status, message: result.message };
  }

  // Duplicate badges
  const badges = await Badge.find({ boardId: board._id });
  console.log(badges);

  for (let i = 0; i < badges.length; i++) {
    const result = await duplicateBadge(badges[i], newBoard._id);
    console.log(result);

    if (result.error)
      return { error: true, status: result.status, message: result.message };
  }

  return {
    error: false,
    status: 201,
    message: "Tabuleiro duplicado com sucesso",
  };
}

async function duplicateTile(tile, boardId) {
  const newTileBody = {
    boardId: boardId,
    boardPosition: tile.boardPosition,
    name: tile.name,
    type: tile.type,
    position: {
      x: tile.position.x,
      y: tile.position.y,
      z: tile.position.z,
    },
    rotation: {
      x: tile.rotation.x,
      y: tile.rotation.y,
      z: tile.rotation.z,
      w: tile.rotation.w,
    },
  };

  if (tile.points) newTileBody["points"] = tile.points;

  if (tile.groupColor) {
    newTileBody["groupColor"] = {
      r: tile.groupColor.r,
      g: tile.groupColor.g,
      b: tile.groupColor.b,
      a: tile.groupColor.a,
    };
  }

  const newTile = await Tile.create(newTileBody).catch(() => {
    return {
      error: true,
      status: 400,
      message: "Erro ao criar as casas do tabuleiro",
    };
  });

  // Duplicate questions
  const questions = await Question.find({ tileId: tile._id });

  for (let i = 0; i < questions.length; i++) {
    const result = await duplicateQuestion(questions[i], newTile._id);

    if (result.error)
      return { error: true, status: result.status, message: result.message };
  }

  // Duplicate tile cards
  const cards = await Card.find({ tileId: tile._id });

  for (let i = 0; i < cards.length; i++) {
    const result = await duplicateCard(cards[i], newTile._id, "tile");

    if (result.error)
      return { error: true, status: result.status, message: result.message };
  }

  return { error: false, status: 201, message: "Casa criada com sucesso" };
}

async function duplicateQuestion(question, tileId) {
  const newQuestionBody = {
    tileId: tileId,
    question: question.question,
    answers: question.answers,
    correctAnswer: question.correctAnswer,
  };

  if (question.image) newQuestionBody["image"] = question.image;

  await Question.create(newQuestionBody).catch(() => {
    return {
      error: true,
      status: 400,
      message: "Erro ao criar as perguntas do tabuleiro",
    };
  });

  return { error: false, status: 201, message: "Pergunta criada com sucesso" };
}

async function duplicateCard(card, resourceId, resourceType) {
  const newCardBody = {
    type: card.type,
    info: card.info,
  };

  if (resourceType === "tile") newCardBody["tileId"] = resourceId;
  else newCardBody["boardId"] = resourceId;

  if (card.subtype) newCardBody["subtype"] = card.subtype;
  if (card.points) newCardBody["points"] = card.points;
  if (card.action) newCardBody["action"] = card.action;
  if (card.actionValue) newCardBody["actionValue"] = card.actionValue;
  if (card.content) newCardBody["content"] = card.content;

  await Card.create(newCardBody).catch(() => {
    return {
      error: true,
      status: 400,
      message: "Erro ao criar as cartas do tabuleiro",
    };
  });

  return { error: false, status: 201, message: "Carta criada com sucesso" };
}

async function duplicateBadge(badge, boardId) {
  await Badge.create({
    boardId: boardId,
    name: badge.name,
    multiplier: badge.multiplier,
    cost: badge.cost,
    image: badge.image,
  }).catch(() => {
    return {
      error: true,
      status: 400,
      message: "Erro ao criar os troféus do tabuleiro",
    };
  });

  return { error: false, status: 201, message: "Troféu criado com sucesso" };
}

async function updateBoard(req, res) {
  const { boardName, name, description, image } = req.body;

  if (!boardName) {
    return res
      .status(400)
      .send({ error: true, message: "Dados mal formatados" });
  }

  const board = await Board.findOne({ name: boardName });

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
  const { boardName, boardPosition, question, answers, correctAnswer } =
    req.body;
  const image = req.file;

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
    image: image?.location,
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
  const { id, question, answers, correctAnswer } = req.body;
  let image = req.file;
  if (!image) image = req.body.image;

  const questionObject = await Question.findById(id);

  if (!questionObject) {
    return res
      .status(404)
      .send({ error: true, message: "Pergunta não encontrada" });
  }

  if (image !== 'no-change') {
    questionObject.image = image?.location;
  }

  questionObject.question = question;
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
  const { userId, boardName, code } = req.body;

  const adminId = sessionCodes.get(code);

  if (!adminId) {
    return res.status(404).send({
      error: true,
      message: "Nenhuma sessão encontrada com o código dado",
    });
  }

  const save = await Save.findById(gameSaves.get(adminId));
  const board = await Board.findById(save.boardId);

  if (boardName !== board.name) {
    return res.status(404).send({
      error: true,
      message: "Nenhuma sessão encontrada para o tabuleiro",
    });
  }

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
  deleteSave,
  getSaves,
  getBoards,
  getAdminBoards,
  getBoard,
  newBoard,
  importBoard,
  duplicateBoard,
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
