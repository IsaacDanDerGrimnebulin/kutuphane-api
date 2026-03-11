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
};
module.exports = dashboardController;
