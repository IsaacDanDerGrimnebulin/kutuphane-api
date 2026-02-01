// routes/feed.routes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

//

router.post("/:id", authenticateToken, reviewController.toggleLike);

module.exports = router;
