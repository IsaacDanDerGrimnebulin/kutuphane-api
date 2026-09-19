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
  async deleteReview(userId, bookId, reviewId) {
    const review = await reviewRepository.findReviewById(reviewId);

    if (!review) {
      throw new CustomError("Yorum bulunamadı", 404, "REVIEW_NOT_FOUND");
    }

    if (review.book_id !== bookId) {
      throw new CustomError(
        "Bu kitaba ait böyle bir yorum bulunamadı",
        404,
        "REVIEW_NOT_FOUND",
      );
    }

    if (review.user_id !== userId) {
      throw new CustomError(
        "Bu yorumu silme yetkiniz yok",
        403,
        "AUTHORIZATION_ERROR",
      );
    }

    const isDeleted = await reviewRepository.deleteById(reviewId);

    if (!isDeleted) {
      throw new CustomError("Yorum silinemedi", 500, "DELETE_FAILED");
    }

    return true;
  },
  async updateReview(reviewData) {
    const { reviewId, bookId, userId, rating, content } = reviewData;

    if (rating === undefined && content === undefined) {
      throw new CustomError(
        "Güncellenecek en az bir alan gönderilmelidir.",
        400,
        "NO_UPDATE_FIELDS",
      );
    }
    // Puan tipi kontrolü
    if (rating !== undefined && !Number.isInteger(rating)) {
      throw new CustomError(
        "Puan tam sayı olmalıdır.",
        400,
        "INVALID_RATING_TYPE",
      );
    }

    // Puan aralığı kontrolü
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new CustomError(
        "Puan 1 ile 5 arasında olmalıdır.",
        400,
        "INVALID_RATING_RANGE",
      );
    }

    // Yorum uzunluğu kontrolü
    if (content !== undefined && (content.length < 3 || content.length > 500)) {
      throw new CustomError(
        "Yorum 3 ile 500 karakter arasında olmalıdır.",
        400,
        "INVALID_COMMENT_LENGTH",
      );
    }

    // Mevcut review'ı bul
    const existingReview = await reviewRepository.findReviewById(reviewId);

    if (!existingReview) {
      throw new CustomError("Yorum bulunamadı.", 404, "REVIEW_NOT_FOUND");
    }

    // Review gerçekten bu kitaba mı ait?
    if (existingReview.book_id !== bookId) {
      throw new CustomError(
        "Bu kitaba ait böyle bir yorum bulunamadı.",
        404,
        "REVIEW_NOT_FOUND",
      );
    }

    // Review'ın sahibi mi?
    if (existingReview.user_id !== userId) {
      throw new CustomError(
        "Bu yorumu güncelleme yetkiniz yok.",
        403,
        "REVIEW_UPDATE_FORBIDDEN",
      );
    }

    // Güncellenecek son değerler
    const finalRating = rating ?? existingReview.rating;
    const finalComment = content ?? existingReview.comment;

    const updated = await reviewRepository.updateReviewById({
      reviewId,
      finalRating,
      finalComment,
    });

    if (!updated) {
      throw new CustomError(
        "Yorum güncellenemedi.",
        500,
        "REVIEW_UPDATE_FAILED",
      );
    }

    return updated;
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
      throw new CustomError("Kullanıcı bulunamadı", 404, "USER_NOT_FOUND");
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
