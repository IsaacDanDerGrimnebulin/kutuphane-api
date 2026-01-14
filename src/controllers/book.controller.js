const bookService = require("../services/book.service");
const CustomError = require("../utils/customError");

/**
 * 2. Controller Katmanı (İletişimci)
 *  Görevi: HTTP dünyası ile uygulama arasındaki köprüdür.
 *  İstekteki verileri (params, query, body) ayıklar.
 *  Servis katmanını çağırır.
 *  Gelen sonucu HTTP durum koduyla (200 OK, 404 Not Found) istemciye döner.
 *  Asla SQL yazmaz, hesaplama yapmaz.
 */
const bookController = {
  // book.controller.js
  async getById(req, res, next) {
    try {
      const book = await bookService.getBookDetails(req.params.id);

      if (!book) {
        throw new CustomError(
          "Aradığınız kitap bulunamadı.",
          404,
          "BOOK_NOT_FOUND"
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
};

module.exports = bookController;
