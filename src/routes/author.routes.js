const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const authorController = require("../controllers/author.controller");

// Sadece ana sayfa akışını sağlayan tek bir endpoint
router.get("/:id", authenticateToken, authorController.getAuthorById);
router.get(
  "/:id/books",
  authenticateToken,
  authorController.getAllBooksByAuthorId,
);
module.exports = router;
