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

      return res.status(201).json({
        success: true,
        message: "Yorum başarıyla oluşturuldu",
        data: review,
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
      const isDeleted = await reviewService.deleteReview(
        req.user.id,
        req.params.id,
        req.params.reviewId,
      );

      res.status(200).json({
        success: true,
        message: "Yorum başarıyla silindi",
        data: isDeleted,
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
      const { rating, content } = req.body;

      const reviewData = { reviewId, bookId, userId, rating, content };

      const review = await reviewService.updateReview(reviewData);

      res.status(200).json({
        success: true,
        message: "İnceleme başarıyla güncellendi",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAllReviews(req, res, next) {
    try {
      const { page, limit } = req.query;
      const userId = req.user.id;
      // TODO: query or search params ? it is a real need?
      const finalLimit = Math.min(parseInt(limit) || 10, 10);
      const finalPage = Math.max(parseInt(page) || 1, 1);
      const queryParams = {
        userId: userId,
        page: finalPage,
        limit: finalLimit,
      };
      // TODO: Yorumların olamaması bir sorun mu? boş liste dönebilir mi?
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
  async toggleLike(req, res, next) {
    try {
      const userId = req.user.id;
      const reviewId = req.params.id;
      const result = await reviewService.toggleLike(userId, reviewId);

      // Başarılı senaryolar (200 veya 201)
      return res.status(result.liked ? 201 : 200).json({
        success: true,
        liked: result.liked,
        message: result.liked ? "Beğeni eklendi" : "Beğeni kaldırıldı",
        data: result.data,
      });
    } catch (error) {
      if (error.code === "23505") {
        throw new CustomError("Zaten beğendiniz.", 409, "ALREADY_LIKED");
      }

      if (error.code === "23503") {
        throw new CustomError(
          "Geçersiz kullanıcı veya inceleme.",
          400,
          "INVALID_REFERENCE",
        );
      }
      next(error);
    }
  },
  async getAllReviewsByUserId(req, res, next) {
    try {
      const { page, limit } = req.query;
      const ownerId = req.user.id;
      const userId = req.params.id;
      // TODO: query or search params ? it is a real need?
      const finalLimit = Math.min(parseInt(limit) || 10, 10);
      const finalPage = Math.max(parseInt(page) || 1, 1);
      const queryParams = {
        ownerId: ownerId,
        userId: userId,
        page: finalPage,
        limit: finalLimit,
      };

      // 2. Servis katmanını çağır
      const result = await reviewService.getAllReviewsByUserId(queryParams);

      const isOwner = String(ownerId) === String(userId);
      res.status(200).json({
        success: true,
        message: "Yorumlar başarıyla getirildi",
        metadata: result.pagination, // Sayfalama bilgileri
        data: result.reviews, // Yorum listesi
        isOwner: isOwner,
      });
    } catch (error) {
      next(error);
    }
  },
  async getLikedReviewsByUserId(req, res, next) {
    try {
      const { page, limit } = req.query;
      const ownerId = req.user.id;
      const userId = req.params.id;
      // TODO: query or search params ? it is a real need?
      const finalLimit = Math.min(parseInt(limit) || 10, 10);
      const finalPage = Math.max(parseInt(page) || 1, 1);
      const queryParams = {
        ownerId: ownerId,
        userId: userId,
        page: finalPage,
        limit: finalLimit,
      };

      // 2. Servis katmanını çağır
      const result = await reviewService.getLikedReviewsByUserId(queryParams);

      if (result.errorType === "USER_NOT_FOUND") {
        throw new CustomError("Kullanıcı bulunamadı", 404, "USER_NOT_FOUND");
      }
      const isOwner = String(ownerId) === String(userId);
      res.status(200).json({
        success: true,
        message: "Yorumlar başarıyla getirildi",
        metadata: result.pagination, // Sayfalama bilgileri
        data: result.reviews, // Yorum listesi
        isOwner: isOwner,
      });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = reviewController;
