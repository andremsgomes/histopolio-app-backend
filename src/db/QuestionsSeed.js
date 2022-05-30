const Question = require("../models/Question");
const Tile = require("../models/Tile");

async function seedQuestions(boardId) {
  // Add all questions
  const tiles = await Tile.find({ boardId: boardId }).sort("boardPosition");

  await Question.create({
    tileId: tiles[1]._id,
    question: "A coloração usada nesta lâmina é o...",
    image: "https://www.linkpicture.com/q/casa1pergunta1.png",
    answers: ["PAS", "Tricrómio de Masson", "Azul de Alcião"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[1]._id,
    question: "Uma estrutura diz-se PATOGNOMÓNICA quando...",
    image: "https://www.linkpicture.com/q/casa1pergunta2.png",
    answers: [
      "é uma característica Patológica de um orgão",
      "é característica de um orgão, permitindo identificá-lo",
      "é designada por um epónimo",
    ],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[1]._id,
    question: "Quantos tecidos fundamentais é que se consideram na Histologia?",
    answers: ["4", "21", "8", "10"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[1]._id,
    question:
      "O tipo de epitélio que se encontra nos órgãos depende da função desempenhada.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[1]._id,
    question: "Qual dos seguintes tecidos NÃO É um tecido fundamental.",
    answers: [
      "Tecido Nervoso",
      "Tecido Epitelial",
      "Tecido Conjuntivo",
      "Tecido ósseo",
    ],
    correctAnswer: 4,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[1]._id,
    question:
      "Na Hematoxilina-Eosina podemos dizer que os núcleos são acidófilos.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[1]._id,
    question:
      "Qual das seguintes colorações é útil para identificar glicoproteínas neutras?",
    answers: [
      "Tricrómio de Masson",
      "Negro do Sudão",
      "Coloração com a Prata",
      "PAS (Ácido Periódico de Schiff)",
    ],
    correctAnswer: 4,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[1]._id,
    question: "O termo CÉLULA foi definido por Antoni Van Leeuwenhoek",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[1]._id,
    question: "Relacione o microscópio com o cientista",
    image: "https://www.linkpicture.com/q/casa1pergunta9.png",
    answers: ["Anton Van Leeuwenhoek", "Jean Marie Bichat", "Robert Hooke"],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[1]._id,
    question: "O termo CORPÚSCULO DE MALPIGHI é um epónimo?",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[3]._id,
    question:
      "Qual das seguintes características é FALSA para o epitélio de transição",
    answers: [
      "Todas as células contactam com o lúmen do órgão.",
      "Todas as células estão assentes na membrana basal.",
      "As células designam-se células em guarda chuva.",
      "Existe nas vias urinárias.",
      "A convexidade apical é característica.",
    ],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[3]._id,
    question: "Qual das seguintes estruturas é visível em microscopia óptica?",
    answers: ["Lâmina basal", "Membrana basal"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[3]._id,
    question: "O epitélio de transição existe na transição entre órgãos.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[3]._id,
    question: "Relacione a imagem com o rótulo correto.",
    image: "https://www.linkpicture.com/q/casa3pergunta2.png",
    answers: [
      "Epitélio pseudoestratificado colunar ciliado",
      "Epitélio simples colunar com prato estriado",
      "Epitélio estratificado pavimentoso não queratinizado",
    ],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[3]._id,
    question: "O epitélio pseudoestratificado pode ser cúbico.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[3]._id,
    question: "Qual das imagens é o epitélio de transição?",
    image: "https://www.linkpicture.com/q/casa3pergunta4.png",
    answers: ["Imagem 1", "Imagem 2", "Imagem 3"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[4]._id,
    question:
      "O epitélio caracteriza-se por ter abundante matriz extracelular.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[7]._id,
    question: "O prato estriado existe em células pavimentosas.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[7]._id,
    question:
      "Os estereocílios existem no aparelho respiratório (arrastam o muco).",
    image: "https://www.linkpicture.com/q/casa7pergunta2.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[7]._id,
    question: "As estruturas apontadas são ácinos serosos.",
    image: "https://www.linkpicture.com/q/casa7pergunta4.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[8]._id,
    question:
      "Qual das seguintes características NÃO se aplica nas células caliciformes",
    answers: [
      "Glândula unicelular",
      "Célula serosa",
      "Presença de teca (área dilatada)",
      "Glândula exócrina",
    ],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[8]._id,
    question:
      "Os crescentes de Gianuzzi são sempre serosos (ou seja, células serosas sobre células mucosas).",
    image: "https://www.linkpicture.com/q/casa8pergunta3.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[8]._id,
    question:
      "Relativamente às características tintoriais, as células apontadas são MUCOSAS.",
    image: "https://www.linkpicture.com/q/casa8pergunta4.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[8]._id,
    question: "As glândulas endócrinas apresentam canais.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[9]._id,
    question:
      "Qual das seguintes características é FALSA para as células serosas.",
    answers: [
      "Produção de fluido seroso, rico em proteínas",
      "Núcleo achatado contra a base da célula",
      "Citoplasma com abundante retículo endoplasmático rugoso",
      "Citoplasma corado com tonalidade eosinófila",
      "Organização tridimensional em ácinos",
    ],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[9]._id,
    question: "Uma glândula cujo canal se divida diz-se RAMIFICADA.",
    image: "https://www.linkpicture.com/q/casa9pergunta3.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[9]._id,
    question:
      "Atendendo à imagem e às estruturas apontadas, estamos a ver uma gândula",
    image: "https://www.linkpicture.com/q/casa9pergunta4.png",
    answers: [
      "composta ramificada",
      "simples não ramificada",
      "composta não ramificada",
      "simples ramificada",
    ],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[11]._id,
    question: "Os mastócitos são originados a partir dos basófilos do sangue.",
    image: "https://www.linkpicture.com/q/casa11pergunta1.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[11]._id,
    question:
      "Qual das seguintes colorações é específica para os mastócitos (metacromasia)?",
    image: "https://www.linkpicture.com/q/casa11pergunta2.png",
    answers: [
      "Azul de Toluidina",
      "Hematoxilina de Mallory",
      "Oil Red",
      "Azul de alcião",
    ],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[11]._id,
    question: "Os mastócitos estão envolvidos em respostas alérgicas.",
    image: "https://www.linkpicture.com/q/casa11pergunta3.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[11]._id,
    question: "Que células se encontram na imagem?",
    image: "https://www.linkpicture.com/q/casa11pergunta4.png",
    answers: ["Plasmócitos", "Mastócitos", "Macrófagos"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[12]._id,
    question:
      "A matriz extracelular no conjuntivo é composta por FIBRAS, COMPONENTE AMORFO e LÍQUIDO INTERSTICIAL.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[12]._id,
    question:
      "Há 3 tipos de fibras no conjuntivo: COLAGÉNIO, ELÁSTICAS e RETICULARES.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[13]._id,
    question:
      "A enzima que polimeriza as moléculas de colagénio para constituir as fibrilhas é a lisil oxidase.",
    image: "https://www.linkpicture.com/q/casa13pergunta1.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[13]._id,
    question: "Identifica",
    image: "https://www.linkpicture.com/q/casa13pergunta2.png",
    answers: ["Fibroblasto", "Fibrócito", "Mastócito"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[13]._id,
    question: "Identifica",
    image: "https://www.linkpicture.com/q/casa13pergunta3.png",
    answers: [
      "Célula Gigante de Corpo Estranho",
      "Célula Gigante de Langhans",
      "Mastócito",
    ],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[14]._id,
    question: "Qual das colorações NÃO é usada para fibras elásticas",
    image: "https://www.linkpicture.com/q/casa14pergunta1.png",
    answers: ["Fucsina Resorcina", "Oil Red", "Orceína"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[14]._id,
    question: "Este é um tecido conjuntivo mucoso.",
    image: "https://www.linkpicture.com/q/casa14pergunta2.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[16]._id,
    question: "Em que localização espera encontrar o tecido da imagem?",
    image: "https://www.linkpicture.com/q/casa16pergunta1.png",
    answers: ["Almofadas plantares", "Tecido subcutâneo", "Em torno da aorta"],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[18]._id,
    question: "Que tecido se encontra na imagem?",
    image: "https://www.linkpicture.com/q/casa18pergunta1.png",
    answers: ["Cartilagem hialina", "Cartilagem elástica", "Fibrocartilagem"],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[18]._id,
    question: "Qual o colagénio predominante nesta imagem?",
    image: "https://www.linkpicture.com/q/casa18pergunta2.png",
    answers: ["|", "||", "|||"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[18]._id,
    question: "Estes grupos isogénicos existem no(a)",
    image: "https://www.linkpicture.com/q/casa18pergunta3.png",
    answers: ["orelha", "metáfise do úmero", "nariz"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[19]._id,
    question:
      "O crescimento da cartilagem a partir do pericôndrio designa-se aposicional.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[19]._id,
    question:
      "No pericôndrio a camada com maior celularidade é a camada externa.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[19]._id,
    question: "Qual é a afirmação FALSA?",
    image: "https://www.linkpicture.com/q/casa19pergunta3.png",
    answers: [
      "As células estão alinhadas perpendicularmente ao eixo longitudinal do osso.",
      "Estão presentes grupos isogéncos axiais.",
      "São elementos de cartilagem hialina.",
    ],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[21]._id,
    question: "Está representado osso compacto?",
    image: "https://www.linkpicture.com/q/casa21pergunta1.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[21]._id,
    question:
      "Os canais de Volkmann são paralelos ao eixo da força aplicada sobre o osso.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[21]._id,
    question: "O osso esponjoso apresenta sistemas intermediários.",
    image: "https://www.linkpicture.com/q/casa21pergunta3.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[23]._id,
    question:
      "No sistema circunferencial interno as lamelas são paralelas à cavidade medular.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[23]._id,
    question: "A seta está a apontar para",
    image: "https://www.linkpicture.com/q/casa23pergunta2.png",
    answers: [
      "lacuna óssea (osteoplasto)",
      "osteócito",
      "osteoclasto",
      "endósteo",
    ],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[23]._id,
    question:
      "A estrutura apontada é um canal de Havers (canal central do osteónio).",
    image: "https://www.linkpicture.com/q/casa23pergunta3.png",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[24]._id,
    question: "Os túbulos T existem no músculo liso.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[24]._id,
    question:
      "O conceito de “fibras” no tecido muscular é diferente do conjuntivo.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 1,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[26]._id,
    question:
      "As caveolae são estruturas patognomónicas do tecido muscular estriado cardíaco.",
    answers: ["Verdadeiro", "Falso"],
    correctAnswer: 2,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[26]._id,
    question: "Nesta imagem está representado músculo",
    image: "https://www.linkpicture.com/q/casa26pergunta2.png",
    answers: [
      "liso",
      "estriado esquelético (variedade visceral)",
      "estriado esquelético (variedade somática)",
      "estriado cardíaco",
    ],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  // TODO: mudar
  await Question.create({
    tileId: tiles[27]._id,
    question: "Nesta imagem está representado músculo",
    image: "https://www.linkpicture.com/q/casa26pergunta2.png",
    answers: [
      "liso",
      "estriado esquelético (variedade visceral)",
      "estriado esquelético (variedade somática)",
      "estriado cardíaco",
    ],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[29]._id,
    question: "Nesta imagem está representado músculo",
    image: "https://www.linkpicture.com/q/casa26pergunta2.png",
    answers: [
      "liso",
      "estriado esquelético (variedade visceral)",
      "estriado esquelético (variedade somática)",
      "estriado cardíaco",
    ],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[31]._id,
    question: "Nesta imagem está representado músculo",
    image: "https://www.linkpicture.com/q/casa26pergunta2.png",
    answers: [
      "liso",
      "estriado esquelético (variedade visceral)",
      "estriado esquelético (variedade somática)",
      "estriado cardíaco",
    ],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[32]._id,
    question: "Nesta imagem está representado músculo",
    image: "https://www.linkpicture.com/q/casa26pergunta2.png",
    answers: [
      "liso",
      "estriado esquelético (variedade visceral)",
      "estriado esquelético (variedade somática)",
      "estriado cardíaco",
    ],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[34]._id,
    question: "Nesta imagem está representado músculo",
    image: "https://www.linkpicture.com/q/casa26pergunta2.png",
    answers: [
      "liso",
      "estriado esquelético (variedade visceral)",
      "estriado esquelético (variedade somática)",
      "estriado cardíaco",
    ],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[37]._id,
    question: "Nesta imagem está representado músculo",
    image: "https://www.linkpicture.com/q/casa26pergunta2.png",
    answers: [
      "liso",
      "estriado esquelético (variedade visceral)",
      "estriado esquelético (variedade somática)",
      "estriado cardíaco",
    ],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  await Question.create({
    tileId: tiles[39]._id,
    question: "Nesta imagem está representado músculo",
    image: "https://www.linkpicture.com/q/casa26pergunta2.png",
    answers: [
      "liso",
      "estriado esquelético (variedade visceral)",
      "estriado esquelético (variedade somática)",
      "estriado cardíaco",
    ],
    correctAnswer: 3,
  }).catch((error) => {
    console.log(error);
  });

  console.log("Added all questions");
}

module.exports = seedQuestions;
