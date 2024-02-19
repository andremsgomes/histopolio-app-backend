const express = require("express");
const multer = require('multer');
const multerConfig = require('./../config/multer');

const router = express.Router();
const authController = require("../controllers/auth-ctrl.js");

router.post("/login", authController.login);
router.post("/signup", multer(multerConfig).single('avatar'), authController.signup);
router.put("/update_profile", authController.updateProfile);

module.exports = router;