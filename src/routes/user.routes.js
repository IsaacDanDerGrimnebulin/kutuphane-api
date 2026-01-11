const express = require("express");
const router = express.Router({ mergeParams: true });

const authenticateToken = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

router.get("/me", authenticateToken.authenticateToken, userController.getMe);

module.exports = router;
