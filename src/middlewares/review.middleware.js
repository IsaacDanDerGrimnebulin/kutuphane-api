const reviewService = require("../services/review.service");
const CustomError = require("../utils/customError");

const reviewMiddleware = {
  async checkReviewOwnership(req, res, next) {
    try {
      const userId = req.user.id;
      const reviewId = req.params.reviewId;
      const bookId = req.params.id;

      if (isNaN(reviewId) || isNaN(bookId)) {
        throw new CustomError(
          "ID değerleri geçerli bir sayı olmalıdır.",
          400,
          "INVALID_ID_FORMAT"
        );
      }
      const review = await reviewService.getReviewById(reviewId);

      if (review.errorType === "REVIEW_NOT_FOUND") {
        throw new CustomError("Review bulunamadı.", 404, "REVIEW_NOT_FOUND");
      }

      if (review.data.book_id !== Number(bookId)) {
        throw new CustomError(
          "Bu kitaba ait böyle bir yorum bulunamadı.",
          404,
          "BOOK_NOT_FOUND"
        );
      }
      // Sahibi mi kontrolü
      if (review.data.user_id !== userId) {
        throw new CustomError(
          "Bu işlem için yetkiniz yok. Sadece kendi yorumunuzu yönetebilirsiniz.",
          403,
          "AUTHENTICATION_ERROR"
        );
      }
      req.review = review;
      next();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = reviewMiddleware;
