const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");

const WebSocket = require("ws");

const {
  processMessage,
  checkWebSocktetsState,
} = require("./src/controllers/websocket-ctrl");
const authRouter = require("./src/routes/auth");
const gameRouter = require("./src/routes/game");

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

checkWebSocktetsState();

wss.on("connection", function connection(ws) {
  console.log("A new client connected!");
  ws.isAlive = true;

  ws.on("message", function message(data) {
    processMessage(ws, data);
  });

  ws.on("pong", function () {
    ws.isAlive = true;
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRouter);
app.use("/api/game", gameRouter);

server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
