const express = require("express");
const router = express.Router({ mergeParams: true }); // :bookId parametresini üstten almak için şart
const reviewController = require("../controllers/review.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { checkReviewOwnership } = require("../middlewares/review.middleware");

router.get("/", authenticateToken, reviewController.getBookReviewsById);
router.post("/", authenticateToken, reviewController.createBookReviewByBookId);
router.delete(
  "/:reviewId",
  authenticateToken,
  checkReviewOwnership,
  reviewController.deleteReviewById,
);
router.put(
  "/:reviewId",
  authenticateToken,
  checkReviewOwnership,
  reviewController.updateReview,
);
module.exports = router;
