const reviewService = require("../services/review.service");

const reviewMiddleware = {
  async checkReviewOwnership(req, res, next) {
    try {
      const userId = req.user.id;
      const reviewId = req.params.reviewId;
      const bookId = req.params.id;

      if (isNaN(reviewId) || isNaN(bookId)) {
        return res.status(400).json({
          success: false,
          message: "ID değerleri geçerli bir sayı olmalıdır.",
          errorType: "INVALID_ID_FORMAT",
          data: null,
        });
      }
      const review = await reviewService.getReviewById(reviewId);

      if (review.errorType === "REVIEW_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Review bulunamadı.",
          errorType: "REVIEW_NOT_FOUND",
          data: null,
        });
      }

      if (review.data.book_id !== Number(bookId)) {
        return res.status(404).json({
          success: false,
          message: "Bu kitaba ait böyle bir yorum bulunamadı.",
          errorType: "BOOK_NOT_FOUND",
          data: null,
        });
      }
      // Sahibi mi kontrolü
      if (review.data.user_id !== userId) {
        return res.status(403).json({
          success: false,
          errorType: "AUTHENTICATION_ERROR",
          message:
            "Bu işlem için yetkiniz yok. Sadece kendi yorumunuzu yönetebilirsiniz.",
          data: null,
        });
      }
      req.review = review;
      next();
    } catch (error) {
      console.log("ERROR: ", error);
      res.status(500).json({
        success: false,
        message: "INTERNAL_ERROR!",
        data: null,
      });
    }
  },
};

module.exports = reviewMiddleware;
