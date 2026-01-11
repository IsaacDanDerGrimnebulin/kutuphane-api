const express = require("express");
const router = express.Router({ mergeParams: true }); // :bookId parametresini üstten almak için şart
const reviewController = require("../controllers/review.controller");

router.get("/", reviewController.getBookReviewsById);
router.post("/", reviewController.createBookReviewByBookId);
router.delete("/:id", reviewController.deleteReviewById);
module.exports = router;
