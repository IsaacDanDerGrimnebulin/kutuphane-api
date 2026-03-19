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
router.get(
  "/charts",
  authenticateToken,
  authorize(["admin"]),
  dashboardController.getCharts,
);
router.get(
  "/lists",
  authenticateToken,
  authorize(["admin"]),
  dashboardController.getTopLists,
);

module.exports = router;
