const { deleteReviewById } = require("../repository/review.repository");
const bookService = require("../services/book.service");
const reviewService = require("../services/review.service");
const CustomError = require("../utils/customError");
const reviewController = {
  async getBookReviewsById(req, res, next) {
    try {
      const { page, limit } = req.query;
      const bookId = req.params.id;
      // TODO: query or search params ? it is a real need?
      const finalLimit = Math.min(parseInt(limit) || 10, 10); // Eğer 10'dan büyükse 10 al, değilse geleni al
      const finalPage = Math.max(parseInt(page) || 1, 1); // En az 1 olsun
      const queryParams = {
        bookId: bookId,
        page: finalPage,
        limit: finalLimit,
      };

      // 2. Servis katmanını çağır
      const result = await reviewService.getBookReviewsById(queryParams);

      if (!result) {
        throw new CustomError("Kitap bulunamadı", 404, "BOOK_NOT_FOUND");
      }
      res.status(200).json({
        success: true,
        message: "Yorumlar başarıyla getirildi",
        metadata: result.pagination, // Sayfalama bilgileri
        data: result.reviews, // Kitap listesi
      });
    } catch (error) {
      next(error);
    }
  },
  async createBookReviewByBookId(req, res, next) {
    try {
      const params = {
        kitap_id: req.params.id, // URL'den gelen (Hangi kitap?)
        kullanici_id: req.user.id, // Token'dan gelen (Kim yazıyor?)
        yorum_metni: req.body.yorum_metni, // Body'den sadece gerekli alan
        puan: req.body.puan, // Body'den sadece gerekli alan
      };

      const review = await reviewService.createBookReviewByBookId(params);
      if (review.errorType === "EMPTY_RATING_OR_REVIEW_TEXT") {
        throw new CustomError(
          "Puan ve yorum alanı boş bırakılamaz.",
          400,
          "EMPTY_RATING_OR_REVIEW_TEXT"
        );
      }
      if (review.errorType === "INVALID_RATING") {
        throw new CustomError(
          "Puan 1 ile 5 arasında olmalıdır",
          400,
          "INVALID_RATING"
        );
      }

      if (review.errorType === "BOOK_NOT_FOUND") {
        throw new CustomError("Kitap bulunamadı", 404, "BOOK_NOT_FOUND");
      }

      if (review.errorType === "DATABASE_ERROR") {
        throw new CustomError(
          "Kayıt sırasında teknik hata.",
          500,
          "DATABASE_ERROR"
        );
      }

      return res.status(201).json({
        success: true,
        data: review.data,
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteReviewById(req, res, next) {
    try {
      const reviewId = req.params.reviewId;
      const bookId = req.params.id;
      const userId = req.user.id;
      const review = await reviewService.deleteReviewById(
        bookId,
        reviewId,
        userId
      );

      if (review.errorType === "REVIEW_NOT_FOUND") {
        throw new CustomError(
          "Değerlendirme silinemedi. Bilgileri kontrol edin veya yetkiniz olduğundan emin olun",
          404,
          "REVIEW_NOT_FOUND"
        );
      }
      res.status(200).json({
        success: true,
        data: review.data,
      });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = reviewController;
