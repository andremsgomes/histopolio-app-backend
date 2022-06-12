const express = require("express");
const router = express.Router();
const gameController = require("../controllers/game-ctrl.js");

router.get("/data/boards", gameController.getBoards);
router.get("/data/board/:board", gameController.getBoard);
router.post("/data/board/update", gameController.updateBoardData);

router.get("/data/:board/:tile/questions", gameController.getQuestions);
router.get("/data/question/:id", gameController.getQuestion);
router.post("/data/questions/new", gameController.newQuestion);
router.post("/data/question/update", gameController.updateQuestion);
router.post("/data/question/delete", gameController.deleteQuestion);

router.get("/data/:board/deck_cards/:deck", gameController.getDeckCards);
router.post("/data/cards/deck/new", gameController.newDeckCard);
router.post("/data/deck_card/update", gameController.updateDeckCard);

router.get("/data/:board/:tile/train_cards", gameController.getTrainCards);
router.post("/data/cards/train_cards/new", gameController.newTrainCard);
router.post("/data/train_card/update", gameController.updateTrainCard);

router.get("/data/card/:id", gameController.getCard);
router.post("/data/card/delete", gameController.deleteCard);

router.get("/data/:board/badges", gameController.getBadges);
router.post("/data/badges/new", gameController.newBadge);

router.get("/data/:board/saves", gameController.getSaves);

router.get("/data/:board/saves/:save", gameController.getPlayers);
router.post("/data/save/update", gameController.updatePlayers);

router.get("/data/:board/players/:user_id", gameController.getPlayerSavedData);

module.exports = router;
