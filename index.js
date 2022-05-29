const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const WebSocket = require("ws");

const seed = require("./src/db/Seed");

const {
  processMessage,
  checkWebSocktetsState,
} = require("./src/controllers/websocket-ctrl");
const authRouter = require("./src/routes/auth");
const gameRouter = require("./src/routes/game");

dotenv.config();

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });

// Database setup
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((e) => {
    console.error("Connection error", e.message);
  });

mongoose.connection
  .once("open", () => {
    console.log("Database connected");
    seed();
  })
  .on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// WebSocket setup
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

server.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
