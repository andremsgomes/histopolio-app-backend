const gameController = require("./game-ctrl");
const loadController = require("./load-ctrl");

let unityWS = null;
let frontendWSs = new Map();
let unityDeadCount = 3;

async function processMessage(ws, data) {
  console.log(data);

  if (data == "unityPong") {
    unityWS.isAlive = true;
    return;
  }

  const dataReceived = JSON.parse(data);
  const command = dataReceived["type"];

  switch (command) {
    case "question":
      await gameController.sendQuestionToFrontend(
        frontendWSs.get(dataReceived["userId"]),
        dataReceived
      );
      break;
    case "identification":
      await authentication(ws, dataReceived);
      break;
    case "answer":
      await gameController.sendDataToUnity(unityWS, dataReceived);
      break;
    case "load board":
      await loadController.loadBoard(unityWS, dataReceived);
      break;
    case "load questions":
      await loadController.loadQuestions(unityWS, dataReceived);
      break;
    case "load cards":
      await loadController.loadCards(unityWS, dataReceived);
      break;
    case "game status":
      await gameController.sendGameStatusToFrontend(
        ws,
        dataReceived["userId"],
        `./data/${dataReceived["board"]}/saves/${dataReceived["saveFile"]}`
      );
      break;
    case "join game":
      await gameController.addPlayerToGame(unityWS, dataReceived);
      break;
    case "turn":
      await gameController.sendTurnToFrontend(
        frontendWSs.get(dataReceived["userId"])
      );
      break;
    case "dice result":
      await gameController.sendDiceResultToUnity(unityWS, dataReceived);
      break;
    case "info shown":
      await gameController.sendInfoShownToFrontend(
        frontendWSs.get(dataReceived["userId"]),
        dataReceived
      );
      break;
    case "save":
      gameController.saveGame(frontendWSs, dataReceived);
      break;
    case "finish turn":
      gameController.sendFinishTurnToFrontend(
        frontendWSs.get(dataReceived["userId"]),
        dataReceived
      );
      break;
    case "continue":
      gameController.sendDataToUnity(unityWS, dataReceived);
      break;
    case "content":
      gameController.sendContentToFrontend(
        frontendWSs.get(dataReceived["userId"]),
        dataReceived
      );
      break;
    case "content viewed":
      gameController.sendDataToUnity(unityWS, dataReceived);
      break;
    case "next player":
      gameController.sendDataToUnity(unityWS, dataReceived);
      break;
    case "badge purchased":
      gameController.updatePlayerBadges(unityWS, frontendWSs, dataReceived);
      break;
    case "load game":
      gameController.loadGame(unityWS, dataReceived);
      break;
    case "load saves":
      loadController.loadSaves(unityWS, dataReceived);
      break;
    case "load badges":
      loadController.loadBadges(ws, dataReceived);
      break;
    case "ready":
      gameController.setGameReady(frontendWSs);
      break;
    default:
      console.log("Unknown message: " + data);
  }
}

async function authentication(ws, dataReceived) {
  if (dataReceived["platform"] == "unity") {
    unityWS = ws;
    unityDeadCount = 0;
    gameController.resendGameStatusIfStarted(frontendWSs);
    console.log("Unity connected");
  } else {
    frontendWSs.set(dataReceived["id"], ws);
    console.log("Users connected: " + frontendWSs.size);
  }
}

async function checkWebSocktetsState() {
  setInterval(async function () {
    if (unityWS != null) {
      if (!unityWS.isAlive) {
        gameController.sendEndGameToFrontend(frontendWSs);
        unityWS.terminate();
        unityWS = null;
        console.log("Unity closed");
      } else {
        unityWS.isAlive = false;
        unityDeadCount = 0;
        unityWS.send("ping");
      }
    } else {
      if (unityDeadCount < 3) {
        unityDeadCount++;
        gameController.sendEndGameToFrontend(frontendWSs);

        if (unityDeadCount == 3) {
          gameController.endGame();
        }
      }
    }

    for (id of frontendWSs.keys()) {
      const ws = frontendWSs.get(id);

      if (!ws.isAlive) {
        gameController.removePlayerFromGame(unityWS, id);
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
