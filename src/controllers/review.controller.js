const { deleteReviewById } = require("../repository/review.repository");
const bookService = require("../services/book.service");
const reviewService = require("../services/review.service");
const reviewController = {
  async getBookReviewsById(req, res) {
    try {
      const { page, limit } = req.query;
      const bookId = req.params.id;

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
        return res
          .status(404)
          .json({ success: false, message: "Kitap bulunamadı" });
      }
      res.status(200).json({
        success: true,
        message: "Yorumlar başarıyla getirildi",
        metadata: result.pagination, // Sayfalama bilgileri
        data: result.reviews, // Kitap listesi
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: "Sunucu hatası!" });
    }
  },
  async createBookReviewByBookId(req, res) {
    try {
      const params = { kitap_id: req.params.id, ...req.body };
      const review = await reviewService.createBookReviewByBookId(params);

      if (review.errorType === "INVALID_RATING") {
        return res
          .status(400) // BAD REQUEST
          .json({ success: false, message: "Puan 1 ile 5 arasında olmalıdır" });
      }

      if (review.errorType === "BOOK_NOT_FOUND") {
        return res
          .status(404) // NOT FOUND
          .json({ success: false, message: "Kitap bulunamadı" });
      }

      if (review.errorType === "DATABASE_ERROR") {
        return res
          .status(500) // SERVER-ERROR
          .json({
            success: false,
            message: "Kayıt sırasında teknik hata.",
          });
      }
      return res.status(201).json({
        success: true,
        data: review.data,
      });
    } catch (error) {
      console.error("Beklenmedik Hata:", error);
      res
        .status(500) // SERVER-ERROR
        .json({
          success: false,
          message: "Sunucu tarafında teknik bir hata oluştu",
        });
    }
  },
  async deleteReviewById(req, res) {
    try {
      const { id } = req.params;
      const review = await reviewService.deleteReviewById(id);

      if (review.errorType === "REVIEW_NOT_FOUND") {
        return res
          .status(404) // NOT FOUND
          .json({ success: false, message: "Review bulunamadı" });
      }
      res.status(200).json({
        success: true,
        data: review.data,
      });
    } catch (error) {
      console.error("Beklenmedik Hata:", error);
      res
        .status(500) // SERVER-ERROR
        .json({
          success: false,
          message: "Sunucu tarafında teknik bir hata oluştu",
        });
    }
  },
};
module.exports = reviewController;
