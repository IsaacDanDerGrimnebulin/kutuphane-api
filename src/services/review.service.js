const bookRepository = require("../repository/book.repository");
const reviewRepository = require("../repository/review.repository");

const reviewService = {
  async getBookReviewsById(queryParams) {
    const { bookId, page = 1, limit = 10 } = queryParams;
    const offset = (page - 1) * limit;
    // 1. Kitap var mı kontrol et
    const bookExists = await bookRepository.exists(bookId);

    if (!bookExists) {
      return null; // Kitap yoksa direkt null dön, aşağıya hiç bakma
    }
    const [reviews, totalCount] = await Promise.all([
      reviewRepository.findByBookId(bookId, limit, offset),
      reviewRepository.getCountByBookId(bookId),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      reviews: reviews,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
      },
    };
  },
  async createBookReviewByBookId(reviwData) {
    const { kitap_id, puan, yorum_metni } = reviwData;
    // 0. Kontrol: Body ve Params kontrolleri (Bunlar her zaman yapılmalı!)
    if (!yorum_metni || !puan) {
      return {
        errorType: "EMPTY_RATING_OR_REVIEW_TEXT",
        data: null,
      };
    }
    // 1. Kontrol: Puan geçerli mi?
    if (puan < 1 || puan > 5) {
      return { errorType: "INVALID_RATING", data: null };
    }
    const bookExists = await bookRepository.exists(kitap_id);
    // 2. Kontrol: Kitap var mı?
    if (!bookExists) {
      return { errorType: "BOOK_NOT_FOUND", data: null };
    }
    // 3. Repository Çağrısı
    const review = await reviewRepository.createNewReviewByBookId(reviwData);

    // 4. Teknik Kontrol (İstediğin yer burası)
    if (!review) {
      // Kitap var ama kayıt başarısız olduysa bu teknik bir sorundur
      return { errorType: "DATABASE_ERROR", data: null };
    }

    return { errorType: null, data: review };
  },
  async deleteReviewById(bookId, reviewId, userId) {
    const deletedReview = await reviewRepository.deleteReviewById(
      bookId,
      reviewId,
      userId
    );
    //console.log(bookId, reviewId, userId);
    if (!deletedReview) {
      return { errorType: "REVIEW_NOT_FOUND", data: null };
    }
    return { errorType: null, data: deletedReview };
  },
  async getReviewById(reviewId) {
    const getReview = await reviewRepository.findReviewById(reviewId);

    if (!getReview) {
      return { errorType: "REVIEW_NOT_FOUND", data: null };
    }
    return { errorType: null, data: getReview };
  },
};

module.exports = reviewService;
