// routes/feed.routes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Sadece ana sayfa akışını sağlayan tek bir endpoint
router.get("/", authenticateToken, reviewController.getAllReviews);

module.exports = router;
