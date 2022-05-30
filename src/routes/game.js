const express = require("express");
const router = express.Router();
const gameController = require("../controllers/game-ctrl.js");

router.get("/data/:board", gameController.getBoard);
router.post("/data/board/update", gameController.updateBoardData);

router.get("/data/:board/:tile/questions", gameController.getQuestions);
router.post("/data/questions/new", gameController.newQuestion);

router.post("/data/cards/deck/new", gameController.newDeckCard);

router.get("/data/:board/:tile/train_cards", gameController.getTrainCards);
router.post("/data/cards/train_cards/new", gameController.newTrainCard);

router.get("/data/:board/badges", gameController.getBadges);
router.post("/data/badges/new", gameController.newBadge);

router.get("/data/:board/saves", gameController.getSaves);

router.get("/data/:board/saves/:save", gameController.getPlayers);
router.post("/data/save/update", gameController.updatePlayers);

router.get("/data/:board/players/:user_id", gameController.getPlayerSavedData);

module.exports = router;
