const { deleteReviewById } = require("../repository/review.repository");
const bookService = require("../services/book.service");
const reviewService = require("../services/review.service");
const CustomError = require("../utils/customError");
const reviewController = {
  async getBookReviewsById(req, res, next) {
    try {
      const { page, limit } = req.query;
      const bookId = req.params.id;
      const userId = req.user.id;
      // TODO: query or search params ? it is a real need?
      const finalLimit = Math.min(parseInt(limit) || 10, 10); // Eğer 10'dan büyükse 10 al, değilse geleni al
      const finalPage = Math.max(parseInt(page) || 1, 1); // En az 1 olsun
      const queryParams = {
        userId: userId,
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
          "EMPTY_RATING_OR_REVIEW_TEXT",
        );
      }
      if (review.errorType === "INVALID_RATING") {
        throw new CustomError(
          "Puan 1 ile 5 arasında olmalıdır",
          400,
          "INVALID_RATING",
        );
      }

      if (review.errorType === "BOOK_NOT_FOUND") {
        throw new CustomError("Kitap bulunamadı", 404, "BOOK_NOT_FOUND");
      }

      if (review.errorType === "DATABASE_ERROR") {
        throw new CustomError(
          "Kayıt sırasında teknik hata.",
          500,
          "DATABASE_ERROR",
        );
      }

      return res.status(201).json({
        success: true,
        message: "Yorum başarıyla oluşturuldu",
        data: review.data,
      });
    } catch (error) {
      // Eğer DB'den UNIQUE kısıtlaması hatası gelirse (örn: email zaten var)
      if (error.code === "23505") {
        throw new CustomError(
          "Bu kitabı zaten oyladınız. Mevcut yorumunuzu düzenleyebilirsiniz",
          409,
          "ALREADY_REVIEWED",
        );
      }
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
        userId,
      );

      if (review.errorType === "REVIEW_NOT_FOUND") {
        throw new CustomError(
          "Değerlendirme silinemedi. Bilgileri kontrol edin veya yetkiniz olduğundan emin olun",
          404,
          "REVIEW_NOT_FOUND",
        );
      }
      res.status(200).json({
        success: true,
        message: "Yorum başarıyla silindi",
        data: review.data,
      });
    } catch (error) {
      next(error);
    }
  },
  async updateReview(req, res, next) {
    try {
      const reviewId = req.params.reviewId;
      const bookId = req.params.id;
      const userId = req.user.id;
      const { puan, yorum_metni } = req.body;

      const reviewData = { reviewId, bookId, userId, puan, yorum_metni };

      const review = await reviewService.updateReview(reviewData);

      if (review.errorType === "INVALID_TYPE") {
        throw new CustomError(
          "Puan bir tam sayı olmalıdır",
          400,
          "INVALID_TYPE",
        );
      }
      if (review.errorType === "OUT_OF_RANGE") {
        throw new CustomError(
          "Puan 0 ile 5 arasında olmalıdır",
          400,
          "OUT_OF_RANGE",
        );
      }
      if (review.errorType === "CONTENT_TOO_LONG_OR_TOO_SHORT") {
        throw new CustomError(
          "Yorum minimum 3, maxiumum 500 karakterden oluşmalı",
          400,
          "CONTENT_TOO_LONG_OR_TOO_SHORT",
        );
      }

      if (review.errorType === "UPDATE_FAILED") {
        throw new CustomError(
          "Güncellenmek istenen inceleme bulunamadı.",
          404,
          "RESOURCE_NOT_FOUND",
        );
      }
      res.status(200).json({
        success: true,
        message: "İnceleme başarıyla güncellendi",
        data: review.data,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAllReviews(req, res, next) {
    try {
      const { page, limit } = req.query;

      // TODO: query or search params ? it is a real need?
      const finalLimit = Math.min(parseInt(limit) || 10, 10);
      const finalPage = Math.max(parseInt(page) || 1, 1);
      const queryParams = {
        page: finalPage,
        limit: finalLimit,
      };

      // 2. Servis katmanını çağır
      const result = await reviewService.getAllReviews(queryParams);

      if (!result) {
        throw new CustomError(
          "Yorumlar listelenemdi",
          404,
          "REVIEWS_NOT_FOUND",
        );
      }
      res.status(200).json({
        success: true,
        message: "Yorumlar başarıyla getirildi",
        metadata: result.pagination, // Sayfalama bilgileri
        data: result.reviews, // Yorum listesi
      });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = reviewController;
