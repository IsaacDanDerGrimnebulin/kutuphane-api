const db = require("../config/db");
const bookRepository = {
  async findById(id) {
    const query = `
            SELECT 
                  b.id AS book_id, 
                  b.title AS book_name, 
                  a.id AS author_id, 
                  a.full_name AS author_name,
                  c.id AS category_id,
                  c.title AS category_title,
                  c.slug AS category_slug,
			        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS average_rating,
              COALESCE(COUNT(r.id), 0) AS review_count
              FROM books b
              JOIN authors a ON b.author_id = a.id
              JOIN categories c ON b.category_id = c.id
			        LEFT JOIN reviews r ON b.id = r.book_id
			        WHERE b.id = $1
			        GROUP BY b.id,a.id,c.id`;
    const result = await db.query(query, [id]);
    const row = result.rows[0];
    if (!row) return null;
    const resultDAL = {
      id: row.book_id,
      kitap_adi: row.book_name,
      ortalama_puan: Number(row.average_rating),
      yorum_sayisi: Number(row.review_count),
      yazar: {
        id: row.author_id,
        ad: row.author_name,
      },
      kategori: {
        id: row.category_id,
        ad: row.category_title,
        slug: row.category_slug,
      },
    };
    return resultDAL;
  },
  // TODO: update function with new table names
  async findAll(filters, limit, offset) {
    const query = `SELECT 
                  b.id AS book_id, 
                  b.title AS book_name, 
                  a.id AS author_id, 
                  a.full_name AS author_name,
                  c.id AS category_id,
                  c.title AS category_title,
                  c.slug AS category_slug,
			        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS average_rating,
              COALESCE(COUNT(r.id), 0) AS review_count
                  FROM books b 
                  JOIN authors a ON b.author_id = a.id 
                  JOIN categories c ON b.category_id = c.id
				  LEFT JOIN reviews r ON b.id = r.book_id
                  WHERE b.title ILIKE $1
				  GROUP BY b.id,a.id,c.id
                  LIMIT $2 OFFSET $3`;
    const result = await db.query(query, [`${filters.q}%`, limit, offset]);
    const results = result.rows.map((row) => {
      return {
        id: row.book_id,
        kitap_adi: row.book_name,
        ortalama_puan: Number(row.average_rating),
        yorum_sayisi: Number(row.review_count),
        yazar: {
          id: row.author_id,
          ad: row.author_name,
        },
        kategori: {
          id: row.category_id,
          ad: row.category_title,
          slug: row.category_slug,
        },
      };
    });

    return results;
  },
  // TODO: update function with new table names
  async countAll(filters) {
    const query = `SELECT COUNT(*) FROM books WHERE title ILIKE $1`;
    const values = [`${filters.q}%`];
    const result = await db.query(query, values);
    return Number(result.rows[0].count);
  },
  // TODO: update function with new table names
  async exists(id) {
    const query = "SELECT EXISTS(SELECT 1 FROM books WHERE id = $1)";
    const result = await db.query(query, [id]);
    return result.rows[0].exists; // true veya false döner
  },
  // TODO: update function with new table names
  // TODO: update auth domain first
  async findReviewedByUser(userId, limit, offset) {
    const query = `SELECT 
                   b.id AS book_id, 
                   b.title,
                   b.cover_url,
                  (SELECT ROUND(AVG(rating)::numeric, 2) 
                  FROM reviews 
                  WHERE book_id = b.id) AS average_rating
              FROM reviews r 
              JOIN books b ON r.book_id = b.id 
              WHERE r.user_id = $1
              ORDER BY r.created_at DESC
              LIMIT $2 OFFSET $3`;
    const result = await db.query(query, [userId, limit, offset]);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.book_id,
        kitap_adi: row.title,
        cover_url: row.cover_url,
        ortalama_puan: Number(row.average_rating),
      };
    });
    return resultDAL;
  },
  // TODO: update function with new table names
  // TODO: update auth domain first
  async findCountReviewedByUser(userId) {
    const query = `SELECT COUNT(*) FROM reviews r
                      JOIN books b ON r.book_id = b.id
                      WHERE r.user_id = $1`;
    const result = await db.query(query, [userId]);
    return Number(result.rows[0].count);
  },
  // TODO: for dashboard
  async total() {
    const query = `SELECT COUNT(*) FROM books`;
    const result = await db.query(query);
    return Number(result.rows[0].count);
  },
  async findHighestRated() {
    const query = `SELECT 
                        k.id,
                        k.kitap_adi, 
                        ROUND(AVG(i.puan)::numeric,2) as avg_rating, 
                        COUNT(i.id) as review_count
                        FROM incelemeler i
                        JOIN kitaplar k  ON k.id = i.kitap_id
                      GROUP BY k.id
                      HAVING COUNT(i.id) > 5
                      ORDER BY avg_rating DESC
                        LIMIT 5`;
    const result = await db.query(query);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.id,
        book_name: row.kitap_adi,
        avg_rating: Number(row.avg_rating),
        review_count: Number(row.review_count),
      };
    });
    return resultDAL;
  },
  async findLowestRated() {
    const query = `SELECT 
                        k.id,
                        k.kitap_adi, 
                        ROUND(AVG(i.puan)::numeric,2) as avg_rating, 
                        COUNT(i.id) as review_count
                        FROM incelemeler i
                        JOIN kitaplar k  ON k.id = i.kitap_id
                      GROUP BY k.id
                      HAVING COUNT(i.id) > 5
                      ORDER BY avg_rating ASC
                        LIMIT 5`;
    const result = await db.query(query);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.id,
        book_name: row.kitap_adi,
        avg_rating: Number(row.avg_rating),
        review_count: Number(row.review_count),
      };
    });
    return resultDAL;
  },
  async findMostReviewed() {
    const query = `SELECT 
                      k.id,
                        k.kitap_adi, 
                      ROUND(AVG(i.puan)::numeric,2) as avg_rating, 
                      COUNT(i.id) as review_count
                    FROM incelemeler i
                    JOIN kitaplar k  ON k.id = i.kitap_id
                    GROUP BY k.id
                    ORDER BY review_count DESC
                    LIMIT 5`;
    const result = await db.query(query);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.id,
        book_name: row.kitap_adi,
        avg_rating: Number(row.avg_rating),
        review_count: Number(row.review_count),
      };
    });
    return resultDAL;
  },
};

module.exports = bookRepository;
