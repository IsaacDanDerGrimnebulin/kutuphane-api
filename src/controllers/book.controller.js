const bookService = require("../services/book.service");
const CustomError = require("../utils/customError");

const bookController = {
  async getById(req, res, next) {
    try {
      const book = await bookService.getBookDetails(req.params.id);

      if (!book) {
        throw new CustomError(
          "Aradığınız kitap bulunamadı.",
          404,
          "BOOK_NOT_FOUND",
        );
      }
      res.status(200).json({
        success: true,
        message: "Kitap başarıyla getirildi",
        data: book,
      });
    } catch (error) {
      // Beklenmedik bir hata (DB bağlantısı koptu vs.)
      next(error);
    }
  },
  async getAllBooks(req, res, next) {
    try {
      // 1. Query parametrelerini al ve varsayılan değerleri belirle
      // req.query'den gelen her şey stringdir, page'i sayıya çeviriyoruz
      const { q, genre, page, limit } = req.query;

      const finalLimit = Math.min(parseInt(limit) || 10, 10); // Eğer 10'dan büyükse 10 al, değilse geleni al
      const finalPage = Math.max(parseInt(page) || 1, 1); // En az 1 olsun
      const queryParams = {
        q: q || "",
        genre: genre || null,
        page: finalPage,
        limit: finalLimit,
      };

      // 2. Servis katmanını çağır
      const result = await bookService.getAllBooks(queryParams);

      // 3. Başarılı yanıt dön
      // Standart bir yapı kullanmak frontend işini kolaylaştırır
      res.status(200).json({
        success: true,
        message: "Kitaplar başarıyla getirildi",
        metadata: result.pagination, // Sayfalama bilgileri
        data: result.books, // Kitap listesi
      });
    } catch (error) {
      next(error);
    }
  },
  async getRevieweBooksdByUser(req, res, next) {
    try {
      // TODO: move pagination control to a brand new middleware to control endpoints return list.
      const { page, limit } = req.query;
      const ownerId = req.user.id;
      const userId = req.params.id;

      const finalLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 10);
      const finalPage = Math.max(parseInt(page) || 1, 1);
      const queryParams = {
        userId: userId,
        page: finalPage,
        limit: finalLimit,
      };

      // 2. Servis katmanını çağır
      const result = await bookService.getRevieweBooksdByUser(queryParams);

      if (result.errorType === "USER_NOT_FOUND") {
        throw new CustomError("Kullanıcı bulunamadı", 404, "USER_NOT_FOUND");
      }
      const isOwner = String(ownerId) === String(userId);
      res.status(200).json({
        success: true,
        message: "Kitaplar başarıyla getirildi",
        metadata: result.pagination,
        data: result.books,
        isOwner: isOwner,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = bookController;
