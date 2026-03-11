const bookRepository = require("../repository/book.repository");
const reviewRepository = require("../repository/review.repository");
const CustomError = require("../utils/customError");
const safePromise = require("../utils/safePromise");

const dashboardService = {
  async getStats() {
    const [totalBooks, totalReviews, averageRating] = await Promise.all([
      safePromise(bookRepository.total(), 0),
      safePromise(reviewRepository.getReviewCount(), 0),
      safePromise(reviewRepository.getAverageRating(), 0),
    ]);

    if (
      totalBooks === null &&
      totalReviews === null &&
      averageRating === null
    ) {
      throw new CustomError(
        "Stats verileri getirilemedi",
        500,
        "SUMMARY_DATA_UNAVAILABLE",
      );
    }
    return { totalBooks, totalReviews, averageRating };
  },
  async getCharts() {},
  async getTopList() {},
  async getActivity() {},
};
module.exports = dashboardService;
