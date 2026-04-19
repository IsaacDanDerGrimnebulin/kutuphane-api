const db = require("../config/db");
const authorRepository = {
  async findHighlightedBooks(id) {
    const query = `SELECT
               					b.id,
                        b.title,
                        COALESCE(COUNT(r.id), 0) as reiew_count
                        FROM books b
                    LEFT JOIN reviews r ON r.book_id = b.id
                    WHERE b.author_id = $1
                    GROUP BY b.id 
                    ORDER BY reiew_count DESC
                    LIMIT 3`;
    const result = await db.query(query, [id]);
    const rows = result.rows[0];
    if (!rows) return null;

    const results = result.rows.map((row) => {
      return {
        book_id: row.id,
        book_name: row.title,
        review_count: row.review_count,
      };
    });
    return results;
  },
  async findById(id) {
    const query = `SELECT 
                        a.*,
                        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating,
                        COUNT(DISTINCT r.id) AS total_reviews,
                        COUNT(DISTINCT b.id) AS total_books_count
                    FROM authors a
                    LEFT JOIN books b ON b.author_id = a.id
                    LEFT JOIN reviews r ON b.id = r.book_id 
                    WHERE a.id = $1
                    GROUP BY a.id, a.full_name`;
    const result = await db.query(query, [id]);
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      name: row.full_name,
      slug: row.slug,
      bio_info: { bio: row.bio, born: row.born, die: row.die },
      stats: {
        avg_rating: Number(row.avg_rating),
        total_reviews: Number(row.total_reviews),
        total_books_count: Number(row.total_books_count),
      },
    };
  },
  async exists(id) {
    const query = "SELECT EXISTS(SELECT 1 FROM authors WHERE id = $1)";
    const result = await db.query(query, [id]);
    return result.rows[0].exists;
  },
  async findAll(authorId, limit, offset) {
    const query = `SELECT b.id,
		                    b.title,
		                    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating
                        FROM books b
                        LEFT JOIN reviews r ON r.book_id = b.id 
                        WHERE b.author_id = $1
                        GROUP BY b.id
                        LIMIT $2 OFFSET $3`;
    const result = await db.query(query, [authorId, limit, offset]);
    const results = result.rows.map((row) => {
      return {
        id: row.id,
        kitap_adi: row.title,
        ortalama_puan: Number(row.avg_rating),
      };
    });

    return results;
  },
  async countAll(authorId) {
    const query = `SELECT COUNT(*) FROM books WHERE author_id=$1`;
    const result = await db.query(query, [authorId]);
    return Number(result.rows[0].count);
  },
};
module.exports = authorRepository;
