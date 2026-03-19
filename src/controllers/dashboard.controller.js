const dashboardService = require("../services/dashboard.service");

const dashboardController = {
  async getStats(req, res, next) {
    try {
      const stats = await dashboardService.getStats();
      res.status(200).json({
        success: true,
        message: "Dashboard stats verileri başarıyla getirildi",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
  async getCharts(req, res, next) {
    try {
      const charts = await dashboardService.getCharts();
      res.status(200).json({
        success: true,
        message: "Dashboard charts verileri başarıyla getirildi",
        data: charts,
      });
    } catch (error) {
      next(error);
    }
  },
  async getTopLists(req, res, next) {
    try {
      const charts = await dashboardService.getTopLists();
      res.status(200).json({
        success: true,
        message: "Dashboard top lists verileri başarıyla getirildi",
        data: charts,
      });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = dashboardController;
