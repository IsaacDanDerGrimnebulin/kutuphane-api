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
};
module.exports = authorController;
