const bookRepository = require("../repository/book.repository");
const userRepository = require("../repository/user.repository");
const CustomError = require("../utils/customError");

const bookService = {
  async getBookDetails(id) {
    const book = await bookRepository.findById(id);
    if (!book) return null;

    return book;
  },
  async getAllBooks(queryParams) {
    const { q = "", page = 1, limit = 10 } = queryParams;

    const offset = (page - 1) * limit;

    // Repository fonksiyonlarını çağırıyoruz
    // Promise.all kullanarak ikisini aynı anda (paralel) çalıştırıyoruz
    const [books, totalCount] = await Promise.all([
      bookRepository.findAll({ q }, limit, offset),
      bookRepository.countAll({ q }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      books: books,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
      },
    };
  },
  async getReviewedBooksByUser(queryParams) {
    const { userId, page = 1, limit = 10 } = queryParams;

    const offset = (page - 1) * limit;

    const exists = await userRepository.exists(userId);
    if (!exists) {
      throw new CustomError("Kullanıcı bulunamadı", 404, "USER_NOT_FOUND");
    }

    const [books, totalCount] = await Promise.all([
      bookRepository.findReviewedByUser(userId, limit, offset),
      bookRepository.findCountReviewedByUser(userId),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      books: books,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
      },
    };
  },
};

module.exports = bookService;
