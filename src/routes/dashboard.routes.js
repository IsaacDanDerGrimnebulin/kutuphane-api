// routes/dashboard.routes.js
const express = require("express");
const router = express.Router();

const {
  authenticateToken,
  authorize,
} = require("../middlewares/auth.middleware");
const dashboardController = require("../controllers/dashboard.controller");

router.get(
  "/stats",
  authenticateToken,
  authorize(["admin"]),
  dashboardController.getStats,
);

module.exports = router;
