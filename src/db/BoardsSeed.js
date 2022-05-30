const Board = require("../models/Board");
const Tile = require("../models/Tile");
const seedBadges = require("./BadgesSeed");
const seedQuestions = require("./QuestionsSeed");

async function seedBoards() {
  // Create Histopolio board
  let board = null;
  await Board.create({
    name: "Histopólio",
  })
    .then((response) => {
      board = response;
      console.log("Histopólio board created");
    })
    .catch(() => {
      console.log("Histopólio board already exists");
    });

  if (board) {
    await seedTiles(board._id);
    await seedBadges(board._id);
    await seedQuestions(board._id);
  }
}

async function seedTiles(boardId) {
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
    name: "Rua Malpighi",
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
    points: 6,
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
    name: "Avenida Epitélio Transição",
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
    points: 8,
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
    name: "Tecido Epitelial",
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
    name: "Travessa Prato Estriado",
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
    points: 8,
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
    name: "Travessa Célula Caliciforme",
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
    boardPosition: 9,
    name: "Rua Ácinos Serosos",
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
    points: 12,
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
    name: "Praça Dos Mastócitos",
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
    points: 14,
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
    name: "Praça Dos Fibrócitos",
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
    points: 14,
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
    name: "Rua Fibras Elásticas",
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
    name: "Tecido Conjuntivo",
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
    name: "Avenida Tecido Adiposo",
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
    name: "Avenida Da Cartilagem",
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
    name: "Praça Dos Condrócitos",
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
    points: 14,
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
    name: "Avenida Do Osso Compacto",
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
    name: "Praça Dos Osteócitos",
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
    name: "Avenida Músculo Liso",
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
    boardPosition: 25,
    name: "Tecido Muscular",
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
    name: "Avenida Músculo Cardíaco",
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
    name: "Rua Dos Discos Intercalares",
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
    name: "Avenida Músculo Esquelético",
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
    name: "Praça Dos Neurónios",
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
    name: "Praça Da Glia",
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
    name: "Praça Dos Astrócitos",
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
    name: "Tecido Nervoso",
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
    name: "Praça Das Células De Schwan",
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
    points: 14,
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
    name: "Rua Das Fibras Nervosas",
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
    points: 14,
    groupColor: {
      r: 0.3700000047683716,
      g: 0.44999998807907104,
      b: 0.23000000417232513,
      a: 1,
    },
  }).catch((error) => {
    console.log(error);
  });

  console.log("Added all tiles");
}

module.exports = seedBoards;
