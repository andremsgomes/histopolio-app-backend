const bcrypt = require("bcrypt");

const User = require("../models/User");

function signup(req, res) {
  const { name, email, password } = req.body;
  const avatar = req.file;

  if (!(name && avatar && email && password)) {
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
    avatarUrl: avatar.location,
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

  const user = await User.findOne({ email: email });

  if (!user) {
    return res
      .status(404)
      .json({ error: true, message: "Utilizador não encontrado" });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(403).json({ error: true, message: "Password errada" });
  }

  const returnUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatarUrl,
    adminToken: user.adminToken,
  };

  return res.status(200).json(returnUser);
}

async function updateProfile(req, res) {
  const { userId, name, avatarToSend, email } = req.body;

  if (!(userId, name && avatarToSend && email)) {
    return res
      .status(400)
      .send({ error: true, message: "Dados mal formatados" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res
      .status(404)
      .send({ error: true, message: "Utilizador não encontrado" });
  }

  user.name = name;
  user.email = email;
  user.avatarUrl = avatarToSend;

  await user.save();

  return res.status(200).send();
}

module.exports = {
  signup,
  login,
  updateProfile,
};
