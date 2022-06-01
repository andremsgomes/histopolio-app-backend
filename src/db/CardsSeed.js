const Card = require("../models/Card");
const Tile = require("../models/Tile");

async function seedCards(boardId) {
  // Add all cards
  await Card.create({
    type: "deck",
    subtype: "community",
    boardId: boardId,
    points: 0,
    action: "none",
    actionValue: "",
    info:
      "Estás no bom caminho para ser um expert e ter um lugar no HISTOPÓDIO! Na PRÓXIMA AULA terás de apresentar a primeira preparação da aula prática e receberás 20 PONTOS.",
  }).catch((error) => {
    console.log(error);
  });

  // await Card.create({
  //   type: "deck",
  //   subtype: "community",
  //   boardId: boardId,
  //   points: 10,
  //   action: "tile",
  //   actionValue: "15",
  //   info:
  //     "Os vídeos da Estação de Treino estão sem som porque o narrador estava rouco! Avança ou Recua até à Estação do TECIDO CONJUNTIVO e edita o vídeo colocando-lhe a narração... Ganhas os pontos da Estação +10 por conseguires aquela voz de rádio!",
  // }).catch((error) => {
  //   console.log(error);
  // });

  await Card.create({
    type: "deck",
    subtype: "community",
    boardId: boardId,
    points: 0,
    action: "none",
    actionValue: "",
    info:
      "Está um bom dia para tirar fotografia!\nFotografa 5 lâminas consecutivas da aula (que estiveres a realizar) e faz a legenda dos elementos a bold. Envia por mail para rmarcos@icbas.up.pt e ganha 20 pontos!",
  }).catch((error) => {
    console.log(error);
  });

  // await Card.create({
  //   type: "deck",
  //   subtype: "community",
  //   boardId: boardId,
  //   points: 10,
  //   action: "tile",
  //   actionValue: "5",
  //   info:
  //     "Os vídeos da Estação de Treino estão sem som porque o narrador estava rouco! Avança ou Recua até à Estação do TECIDO EPITELIAL e edita o vídeo colocando-lhe a narração... Ganhas os pontos da Estação +10 por conseguires aquela voz de rádio!",
  // }).catch((error) => {
  //   console.log(error);
  // });

  await Card.create({
    type: "deck",
    subtype: "chance",
    boardId: boardId,
    points: 25,
    action: "move",
    actionValue: "2",
    info:
      "Por sempre devolveres os livros a tempo, a biblioteca decidiu recompensar-te! Recebe 25 PONTOS e avança DUAS casas.",
  }).catch((error) => {
    console.log(error);
  });

  await Card.create({
    type: "deck",
    subtype: "chance",
    boardId: boardId,
    points: 10,
    action: "move",
    actionValue: "3",
    info:
      "A metade do jogo parece estar mesmo lá ao fundo, mas nas aulas de Histologia estás sempre no bom caminho!\nRecebe 10 PONTOS e avança TRÊS casas.",
  }).catch((error) => {
    console.log(error);
  });

  await Card.create({
    type: "deck",
    subtype: "chance",
    boardId: boardId,
    points: 15,
    action: "move",
    actionValue: "1",
    info:
      "Mereces 15 PONTOS por te teres esforçado a montar todos os ossos que estão no teatro anatómico!\nAvança UMA casa.",
  }).catch((error) => {
    console.log(error);
  });

  await Card.create({
    type: "deck",
    subtype: "chance",
    boardId: boardId,
    points: 20,
    action: "move",
    actionValue: "2",
    info:
      "Foram encontrados 20 PONTOS do Histopólio num cacifo! Como ninguém os reclamou, ficam para ti!\nAvança DUAS casas.",
  }).catch((error) => {
    console.log(error);
  });

  await Card.create({
    type: "deck",
    subtype: "chance",
    boardId: boardId,
    points: 20,
    action: "move",
    actionValue: "5",
    info:
      "Foram produzidas demasiadas moedas de Histopólio, pelo que é necessário distribuir de forma a premiar o MÉRITO!\nRecebe 20 PONTOS e avança CINCO casas.",
  }).catch((error) => {
    console.log(error);
  });

  await Card.create({
    type: "deck",
    subtype: "chance",
    boardId: boardId,
    points: 20,
    action: "move",
    actionValue: "5",
    info:
      "Foram produzidas demasiadas moedas de Histopólio, pelo que é necessário distribuir de forma a premiar o MÉRITO!\nRecebe 20 PONTOS e avança CINCO casas.",
  }).catch((error) => {
    console.log(error);
  });

  const tiles = await Tile.find({ boardId: boardId });

  await Card.create({
    type: "train",
    tileId: tiles[5]._id,
    info: "Assiste ao vídeo para ganhares 20 PONTOS!",
    content: "https://youtu.be/BJ2-uIoOJBE",
  }).catch((error) => {
    console.log(error);
  });

  await Card.create({
    type: "train",
    tileId: tiles[15]._id,
    info: "Assiste ao vídeo para ganhares 20 PONTOS!",
    content: "https://youtu.be/RHNl_Y6BAko",
  }).catch((error) => {
    console.log(error);
  });

  await Card.create({
    type: "train",
    tileId: tiles[15]._id,
    info: "Assiste ao vídeo para ganhares 20 PONTOS!",
    content: "https://youtu.be/wV7AZDmWfhA",
  }).catch((error) => {
    console.log(error);
  });

  // TODO: mudar!!
  await Card.create({
    type: "train",
    tileId: tiles[25]._id,
    info: "Assiste ao vídeo para ganhares 20 PONTOS!",
    content: "https://youtu.be/wV7AZDmWfhA",
  }).catch((error) => {
    console.log(error);
  });

  await Card.create({
    type: "train",
    tileId: tiles[35]._id,
    info: "Assiste ao vídeo para ganhares 20 PONTOS!",
    content: "https://youtu.be/wV7AZDmWfhA",
  }).catch((error) => {
    console.log(error);
  });

  console.log("Added all cards");
}

module.exports = seedCards;
