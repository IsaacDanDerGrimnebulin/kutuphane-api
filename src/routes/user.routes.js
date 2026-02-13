const express = require("express");
const router = express.Router({ mergeParams: true });

const authenticateToken = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

router.get("/me", authenticateToken.authenticateToken, userController.getMe);
router.get(
  "/me/reviewed_books",
  authenticateToken.authenticateToken,
  userController.findAllBookReviewedByUserId,
);
router.get(
  "/:id",
  authenticateToken.authenticateToken,
  userController.getUserProfileByUserId,
);

module.exports = router;
