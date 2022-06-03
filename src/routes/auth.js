const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-ctrl.js");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/update_profile", authController.updateProfile);

module.exports = router;