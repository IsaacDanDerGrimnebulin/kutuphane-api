const authorRepository = require("../repository/author.repository");

const authorService = {
  async getAuthorDetails(id) {
    // Önce sadece yazarı çek
    const author = await authorRepository.findById(id);

    if (!author) {
      return { errorType: "AUTHOR_INFO_NOT_FOUND", data: null };
    }

    // Yazar varsa kitapları çek
    const highlightedBooks = await authorRepository.findHighlightedBooks(id);

    return {
      data: {
        author: author,
        highlightedBooks: highlightedBooks || [],
      },
      errorType: null,
    };
  },
  async getAllBooksByAuthorId(authorId, queryParams) {
    const { page = 1, limit = 10 } = queryParams;

    const offset = (page - 1) * limit;

    const exists = await authorRepository.exists(authorId);

    if (!exists) {
      return { errorType: "AUTHOR_INFO_NOT_FOUND", data: null };
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
      errorType: null,
    };
  },
};
module.exports = authorService;
