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
};
module.exports = authorService;
