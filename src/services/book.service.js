const bookRepository = require("../repository/book.repository");

const bookService = {
  async getBookDetails(id) {
    const book = await bookRepository.findById(id);
    if (!book) return null;

    // İş Mantığı: Kitap ismini büyük harfe çevir veya özel bir format uygula
    book.yazar.ad = book.yazar.ad.toUpperCase();
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
};

module.exports = bookService;
