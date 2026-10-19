const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const Board = require("../src/models/Board");
const Tile = require("../src/models/Tile");
const Question = require("../src/models/Question");
const Card = require("../src/models/Card");
const Badge = require("../src/models/Badge");

function withoutMongoMetadata(document) {
  const { _id, __v, createdAt, updatedAt, ...data } = document.toObject();
  return data;
}

async function uniqueName(Model, originalName) {
  let copyNumber = 1;
  let name = `${originalName} (copy)`;

  while (await Model.exists({ name })) {
    copyNumber += 1;
    name = `${originalName} (copy ${copyNumber})`;
  }

  return name;
}

async function duplicateBoard(boardId) {
  const sourceBoard = await Board.findById(boardId);

  if (!sourceBoard) {
    throw new Error(`Board not found: ${boardId}`);
  }

  const created = { board: null, tiles: [], questions: [], cards: [], badges: [] };

  try {
    created.board = await Board.create({
      adminId: sourceBoard.adminId,
      name: await uniqueName(Board, sourceBoard.name),
      description: sourceBoard.description,
      image: sourceBoard.image,
    });

    const sourceTiles = await Tile.find({ boardId: sourceBoard._id }).sort("boardPosition");
    const tileIds = sourceTiles.map((tile) => tile._id);
    const tileIdMap = new Map();

    for (const sourceTile of sourceTiles) {
      const newTile = await Tile.create({
        ...withoutMongoMetadata(sourceTile),
        boardId: created.board._id,
      });
      created.tiles.push(newTile);
      tileIdMap.set(sourceTile._id.toString(), newTile._id);
    }

    const sourceQuestions = await Question.find({ tileId: { $in: tileIds } });
    for (const question of sourceQuestions) {
      const newQuestion = await Question.create({
        ...withoutMongoMetadata(question),
        tileId: tileIdMap.get(question.tileId.toString()),
      });
      created.questions.push(newQuestion);
    }

    const sourceCards = await Card.find({
      $or: [{ boardId: sourceBoard._id }, { tileId: { $in: tileIds } }],
    });
    for (const card of sourceCards) {
      const cardData = withoutMongoMetadata(card);
      if (card.boardId?.toString() === sourceBoard._id.toString()) {
        cardData.boardId = created.board._id;
      }
      if (card.tileId) {
        cardData.tileId = tileIdMap.get(card.tileId.toString());
      }
      const newCard = await Card.create(cardData);
      created.cards.push(newCard);
    }

    const sourceBadges = await Badge.find({ boardId: sourceBoard._id });
    for (const badge of sourceBadges) {
      const newBadge = await Badge.create({
        ...withoutMongoMetadata(badge),
        boardId: created.board._id,
        name: await uniqueName(Badge, badge.name),
      });
      created.badges.push(newBadge);
    }

    return {
      board: created.board,
      counts: {
        tiles: created.tiles.length,
        questions: created.questions.length,
        cards: created.cards.length,
        badges: created.badges.length,
      },
    };
  } catch (error) {
    await Promise.all([
      Card.deleteMany({ _id: { $in: created.cards.map((item) => item._id) } }),
      Question.deleteMany({ _id: { $in: created.questions.map((item) => item._id) } }),
      Badge.deleteMany({ _id: { $in: created.badges.map((item) => item._id) } }),
      Tile.deleteMany({ _id: { $in: created.tiles.map((item) => item._id) } }),
    ]);
    if (created.board) {
      await Board.deleteOne({ _id: created.board._id });
    }
    throw error;
  }
}

async function main() {
  const boardId = process.argv[2];

  if (!boardId || !mongoose.Types.ObjectId.isValid(boardId)) {
    throw new Error("Usage: npm run duplicate-board -- <BOARD_ID>");
  }
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not set");
  }

  await mongoose.connect(process.env.MONGO_URL);
  const result = await duplicateBoard(boardId);
  console.log(`Created board: ${result.board.name} (${result.board._id})`);
  console.log("Copied:", result.counts);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });