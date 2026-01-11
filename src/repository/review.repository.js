const db = require("../config/db");

const reviewRepository = {
  async findByBookId(bookId, limit, offset) {
    const query = `
        SELECT i.*, k.kullanici_adi
        FROM incelemeler i 
        JOIN kullanicilar k ON i.kullanici_id = k.id 
        WHERE i.kitap_id = $1
        ORDER BY i.tarih DESC 
        LIMIT $2 OFFSET $3`;

    const values = [bookId, limit, offset];
    const result = await db.query(query, values);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.id,
        rating: row.puan,
        comment: row.yorum_metni,
        created_at: row.tarih,
        user: {
          id: row.kullanici_id,
          username: row.kullanici_adi,
        },
      };
    });

    return resultDAL; // Yine map() yaparak DAL formatına çevirebilirsin
  },
  // 2. Toplam sayıyı getiren sorgu
  async getCountByBookId(bookId) {
    const query = `SELECT COUNT(*) FROM incelemeler WHERE kitap_id = $1`;
    const result = await db.query(query, [bookId]);
    return Number(result.rows[0].count);
  },

  async createNewReviewByBookId(reviewData) {
    const query =
      "INSERT INTO incelemeler(kitap_id, kullanici_id, puan, yorum_metni) VALUES ($1, $2, $3, $4) RETURNING *";
    const { kitap_id, kullanici_id, puan, yorum_metni } = reviewData;
    const values = [kitap_id, kullanici_id, puan, yorum_metni];

    const result = await db.query(query, values);
    const row = result.rows[0];
    // Eğer veri eklenemediyse (nadir ama mümkün) null dön
    if (!row) return null;
    return {
      id: row.id,
      book_id: row.kitap_id,
      user_id: row.kullanici_id,
      rating: row.puan,
      comment: row.yorum_metni,
      created_at: row.tarih,
    };
  },
  async deleteReviewById(reviewId) {
    const query = "DELETE FROM incelemeler WHERE id = $1 RETURNING *";

    const result = await db.query(query, [reviewId]);
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      book_id: row.kitap_id,
      user_id: row.kullanici_id,
      rating: row.puan,
      comment: row.yorum_metni,
      created_at: row.tarih,
    };
  },
  async exists(id) {
    const query = "SELECT EXISTS(SELECT 1 FROM incelemeler WHERE id = $1)";
    const result = await db.query(query, [id]);
    return result.rows[0].exists; // true veya false döner
  },
};
module.exports = reviewRepository;
