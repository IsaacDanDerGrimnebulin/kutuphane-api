const userService = require("../services/user.service");
const CustomError = require("../utils/customError");

const userController = {
  async getMe(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);
      if (user.errorType === "USER_NOT_FOUND") {
        throw new CustomError("Kullanıcı bulunamadı.", 404, "USER_NOT_FOUND");
      }

      res.status(200).json({
        success: true,
        message: "Kullancı verisi başarıyla getirildi",
        data: user.data,
      });
    } catch (error) {
      next(error);
    }
  },
  async findAllBookReviewedByUserId(req, res, next) {
    try {
      const { q, page, limit } = req.query;
      const userId = req.user.id;

      const finalLimit = Math.min(parseInt(limit) || 10, 10); // Eğer 10'dan büyükse 10 al, değilse geleni al
      const finalPage = Math.max(parseInt(page) || 1, 1); // En az 1 olsun
      const queryParams = {
        q: q || "",

        page: finalPage,
        limit: finalLimit,
      };

      // 2. Servis katmanını çağır
      const result = await userService.getAllBookReviewedByUser(
        userId,
        queryParams,
      );

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
module.exports = userController;
