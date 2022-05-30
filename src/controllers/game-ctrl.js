const WebSocket = require("ws");
const Badge = require("../models/Badge");
const Board = require("../models/Board");
const Card = require("../models/Card");
const Question = require("../models/Question");
const Tile = require("../models/Tile");

const {
  readJSONFile,
  writeJSONFile,
  fileExists,
  getFilesFromDir,
} = require("../utils/file-utils");

let gameSaveFilePath = "";
let gameBoard = "";
let gameSave = "";
let gameStarted = false;

async function sendQuestionToFrontend(frontendWS, dataReceived) {
  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataReceived));
  }
}

async function sendGameStatusToFrontend(
  frontendWS,
  userId,
  board,
  save,
  saveFilePath
) {
  if (save.length > 0) {
    let playerData = await getPlayerData(saveFilePath, userId);

    if (!playerData) {
      playerData = {
        points: 20,
        position: 0,
        badges: [],
      };
    }

    const rank = await getRank(userId, saveFilePath);
    playerData["rank"] = rank;

    const dataToSend = {
      type: "game status",
      gameStarted: gameStarted && board === gameBoard && save === gameSave,
      playerData: playerData,
      board: board,
      save: save,
    };

    if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
      frontendWS.send(JSON.stringify(dataToSend));
    }
  } else {
    const playerData = {
      points: 20,
      position: 0,
      badges: [],
      rank: 0,
    };

    const dataToSend = {
      type: "game status",
      gameStarted: gameStarted && board === gameBoard,
      playerData: playerData,
      board: board,
      save: gameSave,
    };

    if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
      frontendWS.send(JSON.stringify(dataToSend));
    }
  }
}

async function resendGameStatusIfStarted(frontendWSs) {
  if (gameStarted) {
    for (id of frontendWSs.keys()) {
      sendGameStatusToFrontend(
        frontendWSs.get(id),
        id,
        gameBoard,
        gameSave,
        gameSaveFilePath
      );
    }
  }
}

async function getRank(userId, saveFilePath) {
  const players = readJSONFile(saveFilePath);

  if (!players) return 0;

  players.sort((a, b) => b.points - a.points);

  for (let i = 0; i < players.length; i++) {
    if (players[i].userId === userId) return i + 1;
  }

  return 0;
}

async function setGameReady(frontendWSs) {
  gameStarted = true;

  for (id of frontendWSs.keys()) {
    sendGameStatusToFrontend(
      frontendWSs.get(id),
      id,
      gameBoard,
      gameSave,
      gameSaveFilePath
    );
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
  gameSaveFilePath = "";
  gameBoard = "";
  gameSave = "";
  gameStarted = false;

  console.log("Game ended");
}

function addPlayerToGame(unityWS, dataReceived) {
  let player = getPlayerData(gameSaveFilePath, dataReceived["userId"]);

  if (!player) {
    player = {
      userId: dataReceived["userId"],
      name: dataReceived["name"],
      email: dataReceived["email"],
      points: 20,
      position: 0,
      numTurns: 0,
      totalAnswers: 0,
      correctAnswers: 0,
      badges: [],
      finishedBoard: false,
    };

    let players = readJSONFile(gameSaveFilePath);
    players.push(player);
    writeJSONFile(gameSaveFilePath, players);
  }

  let multiplier = 1;
  const badges = readJSONFile(`./data/${dataReceived["board"]}/Badges.json`);

  if (badges) {
    player.badges.forEach((userBadge) => {
      badge = badges.find((b) => b.id === userBadge);

      if (badge && badge.multiplier > multiplier) multiplier = badge.multiplier;
    });
  }

  const dataToSend = {
    type: "join game",
    userId: player.userId,
    name: player.name,
    avatar: dataReceived["avatar"],
    points: player.points,
    position: player.position,
    numTurns: player.numTurns,
    totalAnswers: player.totalAnswers,
    correctAnswers: player.correctAnswers,
    badges: player.badges,
    multiplier: multiplier,
    finishedBoard: player.finishedBoard,
  };

  if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
    unityWS.send(JSON.stringify(dataToSend));
  }
}

async function removePlayerFromGame(unityWS, userId) {
  const dataToSend = {
    type: "remove player",
    userId: userId,
  };

  if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
    unityWS.send(JSON.stringify(dataToSend));
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
  }
}

async function sendInfoShownToFrontend(frontendWS, dataReceived) {
  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataReceived));
  }
}

async function loadGame(unityWS, dataReceived) {
  gameSaveFilePath = `./data/${dataReceived["board"]}/saves/${dataReceived["file"]}`;
  gameBoard = dataReceived["board"];
  gameSave = dataReceived["file"].substring(
    0,
    dataReceived["file"].indexOf(".json")
  );

  if (!fileExists(gameSaveFilePath)) {
    writeJSONFile(gameSaveFilePath, []);
    console.log("New Game Started!");
  } else console.log("Game Loaded!");

  const players = readJSONFile(gameSaveFilePath);
  const users = readJSONFile("./data/Users.json");

  players.forEach((player) => {
    player["avatar"] = users.find((user) => user.id === player.userId).avatar;
  });

  const dataToSend = {
    type: "players",
    players: players,
  };

  unityWS.send(JSON.stringify(dataToSend));
}

function saveGame(frontendWSs, dataReceived) {
  const players = readJSONFile(gameSaveFilePath);

  const newSavedData = players.map((player) => {
    if (player.userId === dataReceived["userId"]) {
      player.points = dataReceived["points"];
      player.position = dataReceived["position"];
      player.numTurns = dataReceived["numTurns"];
      player.totalAnswers = dataReceived["totalAnswers"];
      player.correctAnswers = dataReceived["correctAnswers"];
      player.finishedBoard = dataReceived["finishedBoard"];
    }

    return player;
  });

  writeJSONFile(gameSaveFilePath, newSavedData);

  console.log("Game Saved!");

  sendUpdateToFrontend(frontendWSs, gameSaveFilePath);
}

async function sendUpdateToFrontend(frontendWSs, saveFile) {
  const players = readJSONFile(saveFile);

  players.sort((a, b) => b.points - a.points);

  let rank = 1;

  players.forEach((player) => {
    const dataToSend = {
      type: "update",
      points: player.points,
      position: player.position,
      rank: rank++,
    };

    ws = frontendWSs.get(player.userId);

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
  }
}

async function sendContentToFrontend(frontendWS, dataReceived) {
  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataReceived));
  }
}

function updatePlayerBadges(unityWS, frontendWSs, dataReceived) {
  const badges = readJSONFile(`./data/${dataReceived.board}/Badges.json`);
  const badgePurchased = badges.find(
    (badge) => badge.id === dataReceived.badgeId
  );

  const players = readJSONFile(
    `./data/${dataReceived.board}/saves/${dataReceived.save}.json`
  );

  players.forEach((player) => {
    if (player.userId === dataReceived.userId) {
      player.badges.push(badgePurchased.id);
      player.points -= badgePurchased.cost;
    }
  });

  writeJSONFile(
    `./data/${dataReceived.board}/saves/${dataReceived.save}.json`,
    players
  );

  let multiplier = 1;
  const player = getPlayerData(
    `./data/${dataReceived.board}/saves/${dataReceived.save}.json`,
    dataReceived.userId
  );

  player.badges.forEach((userBadge) => {
    badge = badges.find((b) => b.id === userBadge);

    if (badge && badge.multiplier > multiplier) multiplier = badge.multiplier;
  });

  dataToSend = {
    type: "new badge",
    userId: dataReceived.userId,
    badgeId: dataReceived.badgeId,
    points: player.points,
    multiplier: multiplier,
  };

  if (unityWS != null && unityWS.readyState === WebSocket.OPEN) {
    unityWS.send(JSON.stringify(dataToSend));
  }

  sendUpdateToFrontend(
    frontendWSs,
    `./data/${dataReceived.board}/saves/${dataReceived.save}.json`
  );
}

function getPlayerData(file, userId) {
  const savedData = readJSONFile(file);

  if (!savedData) return null;

  return savedData.find((player) => player.userId == userId);
}

async function getPlayerSavedData(req, res) {
  const board = req.params.board;
  const userId = req.params.user_id;

  const saveFiles = getFilesFromDir(`./data/${board}/saves/`);
  let saves = [];

  saveFiles.forEach((file) => {
    const player = getPlayerData(`./data/${board}/saves/${file}`, userId);

    if (player) {
      const save = {
        file: file.substring(0, file.indexOf(".json")),
        player: player,
      };

      saves.push(save);
    }
  });

  return res.status(200).json(saves);
}

async function getSavedData(req, res) {
  const board = req.params.board;
  const save = req.params.save;

  const savedData = readJSONFile(`./data/${board}/saves/${save}.json`);

  if (!savedData) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro não existe" });
  }

  return res.status(200).json(savedData);
}

function updateSavedData(req, res) {
  const { board, save, savedData } = req.body;

  writeJSONFile(`./data/${board}/saves/${save}.json`, savedData);

  return res.status(200).send();
}

async function getSaves(req, res) {
  const board = req.params.board;

  const saveFiles = getFilesFromDir(`./data/${board}/saves/`);
  let saves = [];

  saveFiles.forEach((file) => {
    const players = readJSONFile(`./data/${board}/saves/${file}`);

    const save = {
      file: file,
      numPlayers: players.length,
    };

    saves.push(save);
  });

  return res.status(200).json(saves);
}

async function getBoard(req, res) {
  const boardName = req.params.board;

  const board = await Board.findOne({ name: boardName });

  if (!board) {
    return res
      .status(404)
      .json({ error: true, message: "Tabuleiro não encontrado" });
  }

  const tiles = await Tile.find({ boardId: board._id }).sort("boardPosition");
  const tilesArray = JSON.parse(JSON.stringify(tiles));

  for (let i = 0; i < tilesArray.length; i++) {
    if (tilesArray[i].type === "groupProperty" || tilesArray[i].type === "pay") {
      tilesArray[i].questions = (await Question.find({tileId: tilesArray[i]._id})).length;
    }
    else if (tilesArray[i].type === "community") {
      tilesArray[i].cards = (await Card.find({type: "deck", subtype: "community", boardId: board._id})).length;
    }
    else if (tilesArray[i].type === "chance") {
      tilesArray[i].cards = (await Card.find({type: "deck", subtype: "chance", boardId: board._id})).length;
    }
    else if (tilesArray[i].type === "train") {
      tilesArray[i].cards = (await Card.find({type: "train", tileId: tilesArray[i]._id})).length;
    }
  }

  return res.status(200).json(tilesArray);
}

async function updateBoardData(req, res) {
  const { board } = req.body;

  for (let i = 0; i < board.length; i++) {
    try {
      await Tile.findByIdAndUpdate(board[i]._id, board[i], { upsert: true });
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
    return res
      .status(400)
      .send({ error: true, message: error });
  });

  return res.status(201).send();
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
    return res
      .status(400)
      .send({ error: true, message: error });
  });

  return res.status(201).send();
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

module.exports = {
  sendQuestionToFrontend,
  addPlayerToGame,
  removePlayerFromGame,
  sendGameStatusToFrontend,
  resendGameStatusIfStarted,
  setGameReady,
  sendEndGameToFrontend,
  endGame,
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
  getSavedData,
  updateSavedData,
  getSaves,
  getBoard,
  updateBoardData,
  getQuestions,
  newQuestion,
  newDeckCard,
  getTrainCards,
  newTrainCard,
  getBadges,
  newBadge,
};
