const authorService = require("../services/author.service");
const CustomError = require("../utils/customError");

const authorController = {
  async getAuthorById(req, res, next) {
    try {
      const author = await authorService.getAuthorDetails(req.params.id);

      if (author.errorType === "AUTHOR_INFO_NOT_FOUND") {
        throw new CustomError(
          "Aradığınız yazar bulunamadı.",
          404,
          "AUTHOR_NOT_FOUND",
        );
      }
      res.status(200).json({
        success: true,
        message: "Yazar başarıyla getirildi",
        data: author.data,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAllBooksByAuthorId(req, res, next) {
    try {
      const { page, limit } = req.query;
      const authorId = req.params.id;

      const finalLimit = Math.min(parseInt(limit) || 5, 5); // Eğer 10'dan büyükse 10 al, değilse geleni al
      const finalPage = Math.max(parseInt(page) || 1, 1); // En az 1 olsun
      const queryParams = {
        page: finalPage,
        limit: finalLimit,
      };

      const result = await authorService.getAllBooksByAuthorId(
        authorId,
        queryParams,
      );

      if (result.errorType === "AUTHOR_INFO_NOT_FOUND") {
        console.log("HATA");
        throw new CustomError(
          "Aradığınız yazar bulunamadı.",
          404,
          "AUTHOR_NOT_FOUND",
        );
      }

      res.status(200).json({
        success: true,
        message: "Kitaplar başarıyla getirildi",
        metadata: result.pagination,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = authorController;
