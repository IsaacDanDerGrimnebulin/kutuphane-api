const bookRepository = require("../repository/book.repository");
const reviewRepository = require("../repository/review.repository");
const userRepository = require("../repository/user.repository");
const CustomError = require("../utils/customError");

const reviewService = {
  async getBookReviewsById(queryParams) {
    const { userId, bookId, page = 1, limit = 10 } = queryParams;
    const offset = (page - 1) * limit;
    // 1. Kitap var mı kontrol et
    const bookExists = await bookRepository.exists(bookId);
    // Error handling comes from controller.
    if (!bookExists) {
      throw new CustomError("Kitap bulunamadı", 404, "BOOK_NOT_FOUND"); // Kitap yoksa direkt null dön, aşağıya hiç bakma
    }
    const [reviews, totalCount] = await Promise.all([
      reviewRepository.findByBookId(userId, bookId, limit, offset),
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
      throw new CustomError(
        "Puan ve yorum alanı boş bırakılamaz.",
        400,
        "EMPTY_RATING_OR_REVIEW_TEXT",
      );
    }
    // 1. Kontrol: Puan geçerli mi?
    if (puan < 1 || puan > 5) {
      throw new CustomError(
        "Puan 1 ile 5 arasında olmalıdır",
        400,
        "INVALID_RATING",
      );
    }
    const bookExists = await bookRepository.exists(kitap_id);
    // 2. Kontrol: Kitap var mı?
    if (!bookExists) {
      throw new CustomError("Kitap bulunamadı", 404, "BOOK_NOT_FOUND");
    }
    // 3. Repository Çağrısı
    const data = await reviewRepository.createNewReviewByBookId(reviwData);

    // 4. Teknik Kontrol
    if (!data) {
      throw new CustomError(
        "Kayıt sırasında teknik hata.",
        500,
        "DATABASE_ERROR",
      );
    }

    return data;
  },
  // TODO: postpone update
  async deleteReviewById(bookId, reviewId, userId) {
    const deletedReview = await reviewRepository.deleteReviewById(
      bookId,
      reviewId,
      userId,
    );
    //console.log(bookId, reviewId, userId);
    if (!deletedReview) {
      return { errorType: "REVIEW_NOT_FOUND", data: null };
    }
    return { errorType: null, data: deletedReview };
  },
  // TODO: update error handling
  async getReviewById(reviewId) {
    const getReview = await reviewRepository.findReviewById(reviewId);

    if (!getReview) {
      return { errorType: "REVIEW_NOT_FOUND", data: null };
    }
    return { errorType: null, data: getReview };
  },
  // TODO: postpone update
  async updateReview(reviewData) {
    const { reviewId, bookId, userId, puan, yorum_metni } = reviewData;

    // 1. Integer Kontrolü
    if (puan !== undefined && !Number.isInteger(puan)) {
      return { errorType: "INVALID_TYPE", data: null };
    }

    // 2. Puan Sınırı (0-5 arası örneği)
    if (puan !== undefined && (puan < 1 || puan > 5)) {
      return { errorType: "OUT_OF_RANGE", data: null };
    }

    // 3. Yorum Uzunluğu (Örn: Max 500 karakter)
    if (
      (yorum_metni !== undefined && yorum_metni.length > 500) ||
      yorum_metni.length < 3
    ) {
      return { errorType: "CONTENT_TOO_LONG_OR_TOO_SHORT", data: null };
    }
    const existing = await reviewRepository.findReviewById(reviewId);

    const finalRating = puan ?? existing.rating;
    const finalComment = yorum_metni ?? existing.comment;

    const finalReviewData = {
      reviewId,
      bookId,
      userId,
      finalRating,
      finalComment,
    };
    const updated = await reviewRepository.updateReviewById(finalReviewData);

    if (!updated) {
      return { errorType: "UPDATE_FAILED", data: null };
    }
    return { errorType: null, data: updated };
  },
  // TODO: for feed
  async getAllReviews(queryParams) {
    const { userId, page = 1, limit = 10 } = queryParams;

    const offset = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      reviewRepository.getAllReviews(userId, limit, offset),
      reviewRepository.getReviewCount(),
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
  async toggleLike(userId, reviewId) {
    const isExist = await reviewRepository.existingLike(userId, reviewId);
    if (isExist) {
      const removeLike = await reviewRepository.deleteReviewLike(
        userId,
        reviewId,
      );
      return { data: removeLike, errorType: null, liked: false };
    }
    const insertLike = await reviewRepository.addReviewLike(userId, reviewId);
    return { data: insertLike, errorType: null, liked: true };
  },
  async getAllReviewsByUserId(queryParams) {
    const { ownerId, userId, page = 1, limit = 10 } = queryParams;

    const offset = (page - 1) * limit;

    const exists = await userRepository.exists(userId);
    if (!exists) {
      return { errorType: "USER_NOT_FOUND", data: null };
    }

    const [reviews, totalCount] = await Promise.all([
      reviewRepository.getAllReviewByUserId(ownerId, userId, limit, offset),
      reviewRepository.getReviewCountByUserId(userId),
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
  async getLikedReviewsByUserId(queryParams) {
    const { ownerId, userId, page = 1, limit = 10 } = queryParams;

    const offset = (page - 1) * limit;

    const exists = await userRepository.exists(userId);
    if (!exists) {
      return { errorType: "USER_NOT_FOUND", data: null };
    }

    const [reviews, totalCount] = await Promise.all([
      reviewRepository.getLikedReviewsByUserId(ownerId, userId, limit, offset),
      reviewRepository.getLikedReviewsCountByUserId(userId),
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
};

module.exports = reviewService;
