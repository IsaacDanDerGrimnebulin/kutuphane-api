const bookRepository = require("../repository/book.repository");

/**
 * 3. Service Katmanı (Beyin / İş Mantığı)
 *  Görevi: Uygulamanın "akıllı" kısmıdır. Kuralları burada koyarsın.
 *  Veriyi ham haliyle Repository'den alır.
 *  Üzerinde hesaplamalar yapar (Örn: Ortalama puan hesaplama).
 *  AI özetleme servisi gibi dış servisleri çağırır.
 *  Veritabanına doğrudan erişmez, sadece Repository'ye "bana şu veriyi getir" der.
 */

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
