const db = require("../config/db");
const authorRepository = {
  async findHighlightedBooks(id) {
    const query = `SELECT k.id,
                        k.kitap_adi,
                        COALESCE(COUNT(i.id), 0) as inceleme_sayisi
                        FROM kitaplar k
                    LEFT JOIN incelemeler i ON i.kitap_id = k.id
                    WHERE k.yazar_id = $1
                    GROUP BY k.id 
                    ORDER BY inceleme_sayisi DESC
                    LIMIT 3`;
    const result = await db.query(query, [id]);
    const rows = result.rows[0];
    if (!rows) return null;

    const resultDAL = result.rows.map((row) => {
      return {
        book_id: row.id,
        book_name: row.kitap_adi,
        review_count: row.inceleme_sayisi,
      };
    });
    return resultDAL;
  },
  async findById(id) {
    const query = `SELECT * FROM yazarlar 
                   WHERE id = $1`;
    const result = await db.query(query, [id]);
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      name: row.yazar_adi,
      slug: row.slug,
      bio_info: { bio: row.bio, born: row.born, die: row.die },
      stats: {
        avg_rating: row.avg_rating,
        total_reviews: row.total_reviews,
        total_books_count: row.total_books_count,
      },
    };
  },
};
module.exports = authorRepository;
