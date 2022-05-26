const bcrypt = require("bcrypt");

const User = require("../models/User");

function signup(req, res) {
  const { name, avatarToSend, email, password } = req.body;

  if (!(name && avatarToSend && email && password)) {
    return res
      .status(400)
      .send({ error: true, message: "Dados mal formatados" });
  }

  // generate salt to hash password
  const salt = bcrypt.genSaltSync(10);

  // hash password
  const hashedPassword = bcrypt.hashSync(password, salt);

  const body = {
    name: name,
    email: email,
    password: hashedPassword,
    avatarUrl: avatarToSend,
  };

  User.create(body)
    .then((user) => {
      const returnUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatarUrl,
        adminToken: user.adminToken,
      };
      return res.status(201).json(returnUser);
    })
    .catch(() => {
      return res.status(400).json({
        error: true,
        message: "Utilizador já existente",
      });
    });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!(email && password)) {
    return res
      .status(400)
      .send({ error: true, message: "Dados mal formatados" });
  }

  const users = await User.find({email: email});

  if (users.length === 0) {
    return res
      .status(404)
      .json({ error: true, message: "Utilizador não encontrado" });
  }

  const user = users[0];

  if (!await bcrypt.compare(password, user.password)) {
    return res.status(403).json({ error: true, message: "Password errada" });
  }

  const returnUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatarUrl,
    adminToken: user.adminToken,
  };

  return res.status(200).json(returnUser);
}

module.exports = {
  signup,
  login,
};
