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
  async getCharts() {
    const [reviewDistribution, popularGenres] = await Promise.all([
      safePromise(reviewRepository.getDailyReviewCountsLast30Days(), []),
      safePromise(reviewRepository.findMostPopularCategories(), []),

      //safePromise(Promise.reject(new Error("Test fail")), []),
    ]);

    if (reviewDistribution === null && popularGenres === null) {
      throw new CustomError(
        "Charts verileri getirilemedi",
        500,
        "CHARTS_DATA_UNAVAILABLE",
      );
    }
    return { reviewDistribution, popularGenres };
  },
  async getTopLists() {
    const [highestRated, lowestRated, mostReviewed] = await Promise.all([
      safePromise(bookRepository.findHighestRated(), []),
      safePromise(bookRepository.findLowestRated(), []),
      safePromise(bookRepository.findMostReviewed(), []),
    ]);
    if (
      highestRated === null &&
      lowestRated === null &&
      mostReviewed === null
    ) {
      throw new CustomError(
        "Top List verileri getirilemedi",
        500,
        "TOPLISTS_DATA_UNAVAILABLE",
      );
    }
    return { highestRated, lowestRated, mostReviewed };
  },
  async getActivity() {},
};
module.exports = dashboardService;
