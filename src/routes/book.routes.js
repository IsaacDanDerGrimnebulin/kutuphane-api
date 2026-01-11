const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");
const reviewController = require("../controllers/review.controller");
const reviewRoutes = require("./review.routes");

router.get("/:id", bookController.getById);
router.get("/", bookController.getAllBooks);

// REVIEWS ROUTES
router.use("/:id/reviews", reviewRoutes);

module.exports = router;
