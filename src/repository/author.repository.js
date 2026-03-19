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
    const query = `SELECT 
                        y.*,
                        COALESCE(ROUND(AVG(i.puan)::numeric, 2), 0) AS avg_rating,
                        COUNT(DISTINCT i.id) AS total_reviews,
                        COUNT(DISTINCT k.id) AS total_books_count
                    FROM yazarlar y
                    LEFT JOIN kitaplar k ON k.yazar_id = y.id
                    LEFT JOIN incelemeler i ON k.id = i.kitap_id 
                    WHERE y.id = $1
                    GROUP BY y.id, y.yazar_adi`;
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
  async exists(id) {
    const query = "SELECT EXISTS(SELECT 1 FROM yazarlar WHERE id = $1)";
    const result = await db.query(query, [id]);
    return result.rows[0].exists;
  },
  async findAll(authorId, limit, offset) {
    const query = `SELECT k.id,
		                    k.kitap_adi,
		                    COALESCE(ROUND(AVG(i.puan)::numeric, 2), 0) AS ortalama_puan
                        FROM kitaplar k
                        LEFT JOIN incelemeler i ON i.kitap_id = k.id 
                        WHERE k.yazar_id = $1
                        GROUP BY k.id
                        LIMIT $2 OFFSET $3
                        `;
    const result = await db.query(query, [authorId, limit, offset]);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.id,
        kitap_adi: row.kitap_adi,
        ortalama_puan: Number(row.ortalama_puan),
      };
    });

    return resultDAL;
  },
  async countAll(authorId) {
    const query = `SELECT COUNT(*) FROM kitaplar WHERE yazar_id=$1`;
    const result = await db.query(query, [authorId]);
    return Number(result.rows[0].count);
  },
};
module.exports = authorRepository;
