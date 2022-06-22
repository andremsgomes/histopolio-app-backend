const express = require("express");
const router = express.Router();
const gameController = require("../controllers/game-ctrl.js");

router.get("/data/boards", gameController.getBoards);
router.get("/data/admin/:admin/boards/", gameController.getAdminBoards);
router.get("/data/board/:board", gameController.getBoard);
router.post("/data/board/new", gameController.newBoard);
router.put("/data/board/update", gameController.updateBoard);
router.put("/data/board/tiles/update", gameController.updateTiles);

router.get("/data/:board/:tile/questions", gameController.getQuestions);
router.get("/data/question/:id", gameController.getQuestion);
router.post("/data/questions/new", gameController.newQuestion);
router.put("/data/question/update", gameController.updateQuestion);
router.delete("/data/question/:id", gameController.deleteQuestion);

router.get("/data/:board/deck_cards/:deck", gameController.getDeckCards);
router.post("/data/cards/deck/new", gameController.newDeckCard);
router.put("/data/deck_card/update", gameController.updateDeckCard);

router.get("/data/:board/:tile/train_cards", gameController.getTrainCards);
router.post("/data/cards/train_cards/new", gameController.newTrainCard);
router.put("/data/train_card/update", gameController.updateTrainCard);

router.get("/data/card/:id", gameController.getCard);
router.delete("/data/card/:id", gameController.deleteCard);

router.get("/data/:board/badges", gameController.getBadges);
router.get("/data/badge/:id", gameController.getBadge);
router.post("/data/badges/new", gameController.newBadge);
router.put("/data/badge/update", gameController.updateBadge);
router.delete("/data/badge/:id", gameController.deleteBadge);

router.get("/data/:board/saves", gameController.getSaves);

router.get("/data/:board/saves/:save", gameController.getPlayers);
router.put("/data/save/update", gameController.updatePlayers);

router.get("/data/:board/players/:user_id", gameController.getPlayer);
router.post("/data/players/new", gameController.createPlayer);

module.exports = router;
