const WebSocket = require("ws");

const {
  readJSONFile,
  writeJSONFile,
  fileExists,
  getFilesFromDir,
} = require("../utils/file-utils");

let gameSaveFilePath = "";
let gameStarted = false;

async function sendQuestionToFrontend(frontendWS, dataReceived) {
  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataReceived));
  }
}

async function sendGameStatusToFrontend(frontendWS, userId, saveFilePath) {
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
    gameStarted: gameStarted,
    playerData: playerData,
  };

  if (frontendWS != null && frontendWS.readyState === WebSocket.OPEN) {
    frontendWS.send(JSON.stringify(dataToSend));
  }
}

async function resendGameStatusIfStarted(frontendWSs) {
  if (gameStarted) {
    for (id of frontendWSs.keys()) {
      sendGameStatusToFrontend(frontendWSs.get(id), id, gameSaveFilePath);
    }
  }
}

async function getRank(userId, saveFilePath) {
  const players = readJSONFile(saveFilePath);

  players.sort((a, b) => b.points - a.points);

  for (let i = 0; i < players.length; i++) {
    if (players[i].userId === userId) return i + 1;
  }

  return 0;
}

async function setGameReady(frontendWSs) {
  gameStarted = true;

  for (id of frontendWSs.keys()) {
    sendGameStatusToFrontend(frontendWSs.get(id), id, gameSaveFilePath);
  }
}

async function sendEndGameToFrontend(frontendWSs) {
  const dataToSend = {
    type: "game status",
    gameStarted: false,
  };

  for (ws of frontendWSs.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(dataToSend));
  }
}

async function endGame() {
  gameSaveFilePath = "";
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

  player.badges.forEach((userBadge) => {
    badge = badges.find((b) => b.id === userBadge);

    if (badge && badge.multiplier > multiplier) multiplier = badge.multiplier;
  });

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

async function getBoardData(req, res) {
  const board = req.params.board;

  let boardData = readJSONFile(`./data/${board}/BoardData.json`);

  if (!boardData) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro não existe" });
  }

  const questions = readJSONFile(`./data/${board}/Questions.json`);

  if (!questions) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro de perguntas não existe" });
  }

  boardData["groupPropertyTiles"].forEach((tile) => {
    tile["questions"] = 0;
  });

  boardData["payTiles"].forEach((tile) => {
    tile["questions"] = 0;
  });

  questions["questions"].forEach((question) => {
    boardData["groupPropertyTiles"].forEach((tile) => {
      if (question["tileId"] === tile["id"]) {
        tile["questions"]++;
      }
    });

    boardData["payTiles"].forEach((tile) => {
      if (question["tileId"] === tile["id"]) {
        tile["questions"]++;
      }
    });
  });

  const cards = readJSONFile(`./data/${board}/Cards.json`);

  if (!cards) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro de cartas não existe" });
  }

  boardData["stationTiles"].forEach((tile) => {
    tile["cards"] = 0;
  });

  cards["trainCards"].forEach((card) => {
    boardData["stationTiles"].forEach((tile) => {
      if (card["tileId"] === tile["id"]) {
        tile["cards"]++;
      }
    });
  });

  boardData["communityCards"] = cards["communityCards"];
  boardData["chanceCards"] = cards["chanceCards"];

  return res.status(200).json(boardData);
}

function updateBoardData(req, res) {
  const { boardData } = req.body;

  writeJSONFile(`./data/${boardData["name"]}/BoardData.json`, boardData);

  return res.status(200).send();
}

async function getQuestionsData(req, res) {
  const board = req.params.board;
  const tileId = parseInt(req.params.tile);

  const questions = readJSONFile(`./data/${board}/Questions.json`);

  if (!questions) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro não existe" });
  }

  let tileQuestions = [];

  questions["questions"].forEach((question) => {
    if (question["tileId"] === tileId) {
      tileQuestions.push(question);
    }
  });

  return res.status(200).json(tileQuestions);
}

function newQuestion(req, res) {
  const { board, tileId, question, image, answers, correctAnswer } = req.body;

  const questions = readJSONFile(`./data/${board}/Questions.json`);

  if (!questions) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro não existe" });
  }

  const lastId =
    questions["questions"].length > 0
      ? questions["questions"][questions["questions"].length - 1].id
      : 1;

  const newQuestion = {
    id: lastId + 1,
    tileId: tileId,
    question: question,
    image: image,
    answers: answers,
    correctAnswer: correctAnswer,
  };

  questions["questions"].push(newQuestion);

  writeJSONFile(`./data/${board}/Questions.json`, questions);

  return res.status(201).send();
}

function newDeckCard(req, res) {
  const { board, deck, info, points, action, actionValue } = req.body;

  const cards = readJSONFile(`./data/${board}/Cards.json`);

  if (!cards) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro não existe" });
  }

  const lastId =
    cards[deck].length > 0 ? cards[deck][cards[deck].length - 1].id : 1;

  const newCard = {
    id: lastId + 1,
    info: info,
    points: points,
    action: action,
    actionValue: actionValue,
  };

  cards[deck].push(newCard);

  writeJSONFile(`./data/${board}/Cards.json`, cards);

  return res.status(201).send();
}

async function getTrainCardsData(req, res) {
  const board = req.params.board;
  const tileId = parseInt(req.params.tile);

  const cards = readJSONFile(`./data/${board}/Cards.json`);

  if (!cards) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro não existe" });
  }

  let tileCards = [];

  cards["trainCards"].forEach((card) => {
    if (card["tileId"] === tileId) {
      tileCards.push(card);
    }
  });

  return res.status(200).json(tileCards);
}

function newTrainCard(req, res) {
  const { board, tileId, info, content } = req.body;

  const cards = readJSONFile(`./data/${board}/Cards.json`);

  if (!cards) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro não existe" });
  }

  const lastId =
    cards["trainCards"].length > 0
      ? cards["trainCards"][cards["trainCards"].length - 1].id
      : 1;

  const newTrainCard = {
    id: lastId + 1,
    tileId: tileId,
    info: info,
    content: content,
  };

  cards["trainCards"].push(newTrainCard);

  writeJSONFile(`./data/${board}/Cards.json`, cards);

  return res.status(201).send();
}

async function getBadges(req, res) {
  const board = req.params.board;

  const badges = readJSONFile(`./data/${board}/Badges.json`);

  if (!badges) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro não existe" });
  }

  return res.status(200).json(badges);
}

function newBadge(req, res) {
  const { board, name, image, multiplier, cost } = req.body;

  const badges = readJSONFile(`./data/${board}/Badges.json`);

  if (!badges) {
    return res
      .status(404)
      .send({ error: true, message: "O ficheiro não existe" });
  }

  const lastId = badges.length > 0 ? badges[badges.length - 1].id : 1;

  const newBadge = {
    id: lastId + 1,
    name: name,
    multiplier: multiplier,
    cost: cost,
    image: image,
  };

  badges.push(newBadge);

  writeJSONFile(`./data/${board}/Badges.json`, badges);

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
  getBoardData,
  updateBoardData,
  getQuestionsData,
  newQuestion,
  newDeckCard,
  getTrainCardsData,
  newTrainCard,
  getBadges,
  newBadge,
};
