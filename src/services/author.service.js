const authorRepository = require("../repository/author.repository");
const CustomError = require("../utils/customError");

const authorService = {
  async getAuthorDetails(id) {
    // Önce sadece yazarı çek
    const author = await authorRepository.findById(id);

    if (!author) {
      throw new CustomError(
        "Aradığınız yazar bulunamadı.",
        404,
        "AUTHOR_NOT_FOUND",
      );
    }

    // Yazar varsa kitapları çek
    const highlightedBooks = await authorRepository.findHighlightedBooks(id);

    return {
      author: author,
      highlightedBooks: highlightedBooks || [],
    };
  },
  async getAllBooksByAuthorId(authorId, queryParams) {
    const { page = 1, limit = 10 } = queryParams;

    const offset = (page - 1) * limit;

    const exists = await authorRepository.exists(authorId);

    if (!exists) {
      throw new CustomError(
        "Aradığınız yazar bulunamadı.",
        404,
        "AUTHOR_NOT_FOUND",
      );
    }
    const [books, totalCount] = await Promise.all([
      authorRepository.findAll(authorId, limit, offset),
      authorRepository.countAll(authorId),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: books,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
      },
    };
  },
};
module.exports = authorService;
