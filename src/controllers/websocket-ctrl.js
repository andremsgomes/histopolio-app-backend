const gameController = require("./game-ctrl");
const loadController = require("./load-ctrl");

let boardGameWSs = new Map();
let boardGameDeadCounts = new Map();
let frontendWSs = new Map();

async function processMessage(ws, data) {
  console.log(data);

  if (data == "unityPong") {
    ws.isAlive = true;
    return;
  }

  const dataReceived = JSON.parse(data);
  const command = dataReceived["type"];

  switch (command) {
    case "login":
      const adminId = await loadController.login(ws, dataReceived);
      await clearData(adminId.toString());
      break;
    case "question":
      await gameController.sendQuestionToFrontend(
        frontendWSs.get(dataReceived["userId"]),
        dataReceived
      );
      break;
    case "identification":
      await identification(ws, dataReceived);
      break;
    case "answer":
      await gameController.sendDataToUnity(
        boardGameWSs.get(dataReceived["adminId"]),
        dataReceived
      );
      break;
    case "load board":
      await loadController.loadBoard(ws, dataReceived);
      break;
    case "load questions":
      await loadController.loadQuestions(ws, dataReceived);
      break;
    case "load cards":
      await loadController.loadCards(ws, dataReceived);
      break;
    case "game status":
      await gameController.sendGameStatusToFrontend(
        ws,
        dataReceived["userId"],
        dataReceived["board"]
      );
      break;
    case "join game":
      await gameController.addPlayerToGame(
        boardGameWSs.get(dataReceived["adminId"]),
        dataReceived
      );
      break;
    case "dice":
      await gameController.sendDiceToFrontend(
        frontendWSs.get(dataReceived["userId"])
      );
      break;
    case "turn":
      await gameController.sendTurnToFrontend(
        frontendWSs.get(dataReceived["userId"])
      );
      break;
    case "dice result":
      await gameController.sendDiceResultToUnity(
        boardGameWSs.get(dataReceived["adminId"]),
        dataReceived
      );
      break;
    case "info shown":
      await gameController.sendInfoShownToFrontend(
        frontendWSs.get(dataReceived["userId"]),
        dataReceived
      );
      break;
    case "save":
      await gameController.saveGame(frontendWSs, dataReceived);
      break;
    case "finish turn":
      gameController.sendFinishTurnToFrontend(
        frontendWSs.get(dataReceived["userId"]),
        dataReceived
      );
      break;
    case "continue":
      gameController.sendDataToUnity(
        boardGameWSs.get(dataReceived["adminId"]),
        dataReceived
      );
      break;
    case "content":
      gameController.sendContentToFrontend(
        frontendWSs.get(dataReceived["userId"]),
        dataReceived
      );
      break;
    case "content viewed":
      gameController.sendDataToUnity(
        boardGameWSs.get(dataReceived["adminId"]),
        dataReceived
      );
      break;
    case "next player":
      gameController.sendDataToUnity(
        boardGameWSs.get(dataReceived["adminId"]),
        dataReceived
      );
      break;
    case "badge purchased":
      gameController.updatePlayerBadges(
        boardGameWSs,
        frontendWSs,
        dataReceived
      );
      break;
    case "load game":
      gameController.loadGame(ws, dataReceived);
      break;
    case "load saves":
      loadController.loadSaves(ws, dataReceived);
      break;
    case "load badges":
      loadController.loadBadges(ws, dataReceived);
      break;
    case "ready":
      gameController.setGameReady(frontendWSs, dataReceived);
      break;
    default:
      console.log("Unknown message: " + data);
  }
}

async function clearData(id) {
  await gameController.endGame(id);
  loadController.deletePendingMessages(id);
  boardGameDeadCounts.delete(id);
}

async function identification(ws, dataReceived) {
  if (dataReceived["platform"] == "unity") {
    boardGameWSs.set(dataReceived["adminId"], ws);
    boardGameDeadCounts.set(dataReceived["adminId"], 0);
    gameController.resendGameStatusIfStarted(
      dataReceived["adminId"],
      frontendWSs
    );
    loadController.sendPendingMessages(dataReceived["adminId"], ws);
    gameController.sendPendingMessages(dataReceived["adminId"], ws);
    console.log("Unity connected");
  } else {
    frontendWSs.set(dataReceived["id"], ws);
    console.log("Users connected: " + frontendWSs.size);
  }
}

async function checkWebSocktetsState() {
  setInterval(async function () {
    for (id of boardGameDeadCounts.keys()) {
      const ws = boardGameWSs.get(id);

      if (ws) {
        if (!ws.isAlive) {
          await gameController.sendEndGameToFrontend(id, frontendWSs);
          ws.terminate();
          boardGameWSs.delete(id);
          console.log("Board game closed");
        } else {
          ws.isAlive = false;
          boardGameDeadCounts.set(id, 0);
          ws.send("ping");
        }
      } else {
        if (boardGameDeadCounts.get(id) < 30) {
          boardGameDeadCounts.set(id, boardGameDeadCounts.get(id) + 1);
          await gameController.sendEndGameToFrontend(id, frontendWSs);

          if (boardGameDeadCounts.get(id) === 30) {
            await clearData(id);
          }
        }
      }
    }

    for (id of frontendWSs.keys()) {
      const ws = frontendWSs.get(id);

      if (!ws.isAlive) {
        await gameController.removePlayerFromGame(boardGameWSs, id);
        ws.terminate();
        frontendWSs.delete(id);
        console.log(`User ${id} disconnected!`);
      } else {
        ws.isAlive = false;
        ws.ping();
      }
    }
  }, 2000);
}

module.exports = {
  processMessage,
  checkWebSocktetsState,
};
