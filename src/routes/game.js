const express = require("express");
const router = express.Router();
const gameController = require("../controllers/game-ctrl.js");

router.get("/data/:board", gameController.getBoardData);
router.post("/data/board/update", gameController.updateBoardData);

router.get("/data/:board/:tile/questions", gameController.getQuestionsData);
router.post("/data/questions/new", gameController.newQuestion);

router.post("/data/cards/deck/new", gameController.newDeckCard);

router.get("/data/:board/:tile/train_cards", gameController.getTrainCardsData);
router.post("/data/cards/train_cards/new", gameController.newTrainCard);

router.get("/data/:board/badges", gameController.getBadges);
router.post("/data/badges/new", gameController.newBadge);

router.get("/data/:board/saves", gameController.getSaves);

router.get("/data/:board/saves/:save", gameController.getSavedData);
router.post("/data/save/update", gameController.updateSavedData);

router.get("/data/:board/:user_id/player", gameController.getPlayerSavedData);

module.exports = router;
