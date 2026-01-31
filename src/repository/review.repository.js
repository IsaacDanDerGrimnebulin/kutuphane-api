const db = require("../config/db");

const reviewRepository = {
  async findByBookId(userId, bookId, limit, offset) {
    const query = `
              SELECT i.*, k.kullanici_adi,
              i.begeni_sayisi AS "likeCount",
              EXISTS (
                SELECT 1 FROM inceleme_begenileri
                  WHERE inceleme_id = i.id AND kullanici_id = $1
              ) AS "isLiked"
              FROM incelemeler i 
              JOIN kullanicilar k ON i.kullanici_id = k.id 
              WHERE i.kitap_id = $2
              ORDER BY i.tarih DESC 
              LIMIT $3 OFFSET $4
       `;

    const values = [userId, bookId, limit, offset];
    const result = await db.query(query, values);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.id,
        rating: row.puan,
        comment: row.yorum_metni,
        created_at: row.tarih,
        isLiked: row.isLiked,
        likeCount: row.likeCount,
        user: {
          id: row.kullanici_id,
          username: row.kullanici_adi,
        },
      };
    });

    return resultDAL; // Yine map() yaparak DAL formatına çevirebilirsin
  },

  async getReviewCount() {
    const query = `SELECT COUNT(*)::INT FROM incelemeler`;
    const result = await db.query(query, []);
    return Number(result.rows[0].count);
  },

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
  async deleteReviewById(bookId, reviewId, userId) {
    const query =
      "DELETE FROM incelemeler WHERE id = $1 AND kitap_id = $2 AND kullanici_id = $3 RETURNING *";

    const result = await db.query(query, [reviewId, bookId, userId]);
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
  async updateReviewById(reviewData) {
    const query = `UPDATE incelemeler
                   SET puan = $4 ,yorum_metni= $5
                   WHERE id = $1 AND kitap_id = $2 AND kullanici_id = $3
                   RETURNING *`;
    const { reviewId, bookId, userId, finalRating, finalComment } = reviewData;
    const result = await db.query(query, [
      reviewId,
      bookId,
      userId,
      finalRating,
      finalComment,
    ]);
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
  async findReviewById(id) {
    const query = "SELECT * FROM incelemeler WHERE id = $1";
    const result = await db.query(query, [id]);
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
  async getAllReviews(userId, limit, offset) {
    const query = `SELECT 
                    i.id AS inceleme_id,
                    i.yorum_metni,
                    i.puan,
                    i.tarih AS created_at,
					          i.begeni_sayisi AS "like_count",
                    k.id AS kitap_id,
                    k.kitap_adi,
                    y.id AS yazar_id,
                    y.yazar_adi,
                    ku.id AS kullanici_id,
                    ku.kullanici_adi,
					EXISTS (SELECT 1 FROM inceleme_begenileri
					WHERE inceleme_id = i.id AND kullanici_id = $1) AS "isLiked"
                FROM incelemeler i
                JOIN kitaplar k ON k.id = i.kitap_id
                JOIN kullanicilar ku ON ku.id = i.kullanici_id
                JOIN yazarlar y ON y.id = k.yazar_id
                ORDER BY i.tarih DESC
                LIMIT $2 OFFSET $3`;
    const values = [userId, limit, offset];
    const result = await db.query(query, values);
    const resultDAL = result.rows.map((row) => {
      return {
        review_id: row.inceleme_id,
        rating: row.puan,
        comment: row.yorum_metni,
        created_at: row.created_at,
        isLiked: row.isLiked,
        like_count: row.like_count,
        book: {
          id: row.kitap_id,
          name: row.kitap_adi,
        },
        author: {
          id: row.yazar_id,
          name: row.yazar_adi,
        },
        user: {
          id: row.kullanici_id,
          name: row.kullanici_adi,
        },
      };
    });
    return resultDAL;
  },
};
module.exports = reviewRepository;
