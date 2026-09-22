const db = require("../config/db");
const { nanoid } = require("nanoid");
const reviewRepository = {
  // TODO: change columns and title with behaviour
  async findByBookId(userId, bookId, limit, offset) {
    const query = `SELECT r.*, p.username,
              	(SELECT COUNT(*) FROM likes
					WHERE review_id = r.id) AS like_count,
              EXISTS (
                SELECT 1 FROM likes
                  WHERE review_id = r.id AND user_id = $1
              ) AS is_liked
              FROM reviews r
              JOIN users u ON r.user_id = u.id 
			  JOIN profiles p ON p.user_id = u.id
              WHERE r.book_id = $2
              ORDER BY r.created_at DESC 
              LIMIT $3 OFFSET $4`;

    const values = [userId, bookId, limit, offset];
    const result = await db.query(query, values);
    const results = result.rows.map((row) => {
      return {
        id: row.id,
        rating: row.rating,
        comment: row.content,
        created_at: row.created_at,
        isLiked: row.is_liked,
        likeCount: Number(row.like_count), // important update dont forget
        user: {
          id: row.user_id,
          username: row.username,
        },
      };
    });

    return results;
  },

  async getReviewCount() {
    const query = `SELECT COUNT(*)::INT FROM reviews`;
    const result = await db.query(query, []);
    return Number(result.rows[0].count);
  },
  // TODO: update column title
  async getCountByBookId(bookId) {
    const query = `SELECT COUNT(*) FROM reviews WHERE book_id = $1`;
    const result = await db.query(query, [bookId]);
    return Number(result.rows[0].count);
  },
  // TODO: update column with new titles
  async createNewReviewByBookId(reviewData) {
    const id = nanoid();
    const query =
      "INSERT INTO reviews(id,book_id,user_id,content,rating) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const { kitap_id, kullanici_id, puan, yorum_metni } = reviewData;
    const values = [id, kitap_id, kullanici_id, yorum_metni, puan];

    const result = await db.query(query, values);
    const row = result.rows[0];
    // Eğer veri eklenemediyse (nadir ama mümkün) null dön
    if (!row) return null;
    return {
      id: row.id,
      book_id: row.book_id,
      user_id: row.user_id,
      rating: row.rating,
      comment: row.content,
      created_at: row.created_at,
    };
  },
  async deleteById(reviewId) {
    const query = "DELETE FROM reviews WHERE id = $1";
    const result = await db.query(query, [reviewId]);
    return result.rowCount > 0;
  },
  async updateReviewById(reviewData) {
    const query = `UPDATE reviews
                              SET rating = $2,
                                  content = $3,
                                  updated_at = NOW()
                              WHERE id = $1
                              RETURNING *`;

    const { reviewId, finalRating, finalComment } = reviewData;
    const result = await db.query(query, [reviewId, finalRating, finalComment]);
    const row = result.rows[0];

    if (!row) return null;

    return {
      id: row.id,
      book_id: row.book_id,
      user_id: row.user_id,
      rating: row.rating,
      comment: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  },
  async exists(id) {
    const query = "SELECT EXISTS(SELECT 1 FROM incelemeler WHERE id = $1)";
    const result = await db.query(query, [id]);
    return result.rows[0].exists; // true veya false döner
  },
  // TODO: update columns
  async findReviewById(id) {
    //
    const query = "SELECT * FROM reviews WHERE id = $1";
    const result = await db.query(query, [id]);
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      book_id: row.book_id,
      user_id: row.user_id,
      rating: row.rating,
      comment: row.content,
      created_at: row.created_at,
    };
  },
  // TODO: like_count must return integer values
  async getAllReviews(userId, limit, offset) {
    const query = `SELECT 
                    r.id AS review_id,
                    r.content,
                    r.rating,
                    r.created_at,
                    (SELECT COUNT(*) FROM likes
					            WHERE review_id = r.id)  AS "like_count",
                    b.id AS book_id,
                    b.title,
                    a.id AS author_id,
                    a.full_name,
                    u.id AS user_id,
                    p.username,
					EXISTS (SELECT 1 FROM likes
					WHERE review_id = r.id AND user_id = $1) AS "is_liked"
                FROM reviews r
                JOIN books b ON b.id = r.book_id
                JOIN users u ON u.id = r.user_id
				JOIN profiles p ON u.id = p.user_id
                JOIN authors a ON a.id = b.author_id
                ORDER BY r.created_at DESC
                LIMIT $2 OFFSET $3`;
    const values = [userId, limit, offset];
    const result = await db.query(query, values);
    const results = result.rows.map((row) => {
      return {
        review_id: row.review_id,
        rating: row.rating,
        comment: row.content,
        created_at: row.created_at,
        isLiked: row.is_liked,
        like_count: row.like_count,
        book: {
          id: row.book_id,
          name: row.title,
        },
        author: {
          id: row.author_id,
          name: row.full_name,
        },
        user: {
          id: row.user_id,
          name: row.username,
        },
      };
    });
    return results;
  },
  async addReviewLike(userId, reviewId) {
    const query = `INSERT INTO inceleme_begenileri (kullanici_id, inceleme_id) VALUES ($1, $2) RETURNING *`;
    const values = [userId, reviewId];
    const result = await db.query(query, values);
    const row = result.rows[0];
    return {
      like_id: row.id,
      review_id: row.inceleme_id,
      user_id: row.kullanici_id,
      created_at: row.created_at,
    };
  },
  async deleteReviewLike(userId, reviewId) {
    const query = `DELETE FROM inceleme_begenileri
                       WHERE kullanici_id = $1 AND inceleme_id = $2 RETURNING *`;
    const values = [userId, reviewId];
    const result = await db.query(query, values);
    const row = result.rows[0];

    return {
      like_id: row.id,
      review_id: row.inceleme_id,
      user_id: row.kullanici_id,
      created_at: row.created_at,
    };
  },
  async existingLike(userId, reviewId) {
    const query = `SELECT EXISTS (SELECT id FROM inceleme_begenileri
                   WHERE kullanici_id = $1 AND inceleme_id = $2)`;
    const values = [userId, reviewId];
    const result = await db.query(query, values);

    return result.rows[0].exists;
  },
  // TODO: like_count must return integer value
  async getAllReviewByUserId(ownerId, userId, limit, offset) {
    const query = `SELECT 
                    r.id AS review_id,
                    r.content,
                    r.rating,
                    r.created_at AS created_at,
                    (SELECT COUNT(*) FROM likes
					WHERE review_id = r.id)  AS like_count,
                    b.id AS book_id,
                    b.title AS book_name,
                    a.id AS author_id,
                    a.full_name AS author_name,
                    u.id AS user_id,
                    p.username,
					EXISTS (SELECT 1 FROM likes
					-- $1 login olan kimse auth üzerinden id al
					WHERE review_id = r.id AND user_id = $1) AS is_liked
                FROM reviews r
                JOIN books b ON b.id = r.book_id
                JOIN users u ON u.id = r.user_id
				JOIN profiles p ON p.user_id = u.id
                JOIN authors a ON a.id = b.author_id
                WHERE r.user_id = $2
                ORDER BY r.created_at DESC
				-- Burası profiline bakılan kimse param olarak id al
                LIMIT $3 OFFSET $4`;
    const values = [ownerId, userId, limit, offset];
    const result = await db.query(query, values);
    const resultDAL = result.rows.map((row) => {
      return {
        review_id: row.review_id,
        rating: row.rating,
        comment: row.content,
        created_at: row.created_at,
        isLiked: row.is_liked,
        like_count: row.like_count,
        book: {
          id: row.book_id,
          name: row.book_name,
        },
        author: {
          id: row.author_id,
          name: row.author_name,
        },
        user: {
          id: row.user_id,
          name: row.username,
        },
      };
    });
    return resultDAL;
  },
  // UPDATED: like_count behavior has changed
  async getLikedReviewsByUserId(ownerId, userId, limit, offset) {
    const query = `SELECT
                      r.id AS review_id,
                      r.user_id AS reviewer_id,
                      p.username AS reviewer_username,
                      r.rating,
                      r.content,
                      r.created_at,
                      (SELECT COUNT(*)  FROM likes
                      WHERE review_id = r.id)::INT AS like_count,
                      b.id AS book_id,
                      b.title AS book_title,
                      a.id AS author_id,
                      a.full_name AS author_name,
                      (auth_likes.user_id IS NOT NULL) AS is_liked
                      FROM reviews r
                      JOIN books b ON b.id = r.book_id
                      JOIN authors a ON a.id = b.author_id
                      JOIN likes l ON r.id = l.review_id
                      JOIN users u ON u.id= r.user_id
                      JOIN profiles p ON  u.id = p.user_id
                      LEFT JOIN likes auth_likes
                        ON auth_likes.review_id = r.id
                        AND auth_likes.user_id = $1
                      WHERE l.user_id = $2
                      ORDER BY l.created_at DESC
                      LIMIT $3 OFFSET $4
                    `;
    const values = [ownerId, userId, limit, offset];
    const result = await db.query(query, values);
    const resultDAL = result.rows.map((row) => {
      return {
        review_id: row.review_id,
        rating: row.rating,
        comment: row.content,
        created_at: row.created_at,
        is_liked: row.is_liked,
        like_count: row.like_count,
        book: {
          id: row.book_id,
          name: row.book_title,
        },
        author: {
          id: row.author_id,
          name: row.author_name,
        },
        user: {
          id: row.reviewer_id,
          name: row.reviewer_username,
        },
      };
    });
    return resultDAL;
  },
  async getReviewCountByUserId(userId) {
    const query = `SELECT COUNT(*)::INT FROM reviews
                    WHERE user_id = $1`;
    const result = await db.query(query, [userId]);
    return Number(result.rows[0].count);
  },
  async getLikedReviewsCountByUserId(userId) {
    const query = `SELECT COUNT(*)::INT FROM likes
                    WHERE user_id = $1`;
    const result = await db.query(query, [userId]);
    return Number(result.rows[0].count);
  },
  async getAverageRating() {
    const query =
      "SELECT ROUND(AVG(puan)::numeric, 2) as average_rating FROM incelemeler";
    const result = await db.query(query);
    return Number(result.rows[0].average_rating);
  },
  // TODO: make the day value dynamic if needed
  async getDailyReviewCountsLast30Days() {
    const query = `SELECT
                        DATE(tarih) AS day,
                        COUNT(*) AS count
                    FROM incelemeler
                    WHERE tarih >= NOW() - INTERVAL '30 days'
                    GROUP BY day
                    ORDER BY day`;
    const result = await db.query(query);
    const data = result.rows.map((row) => {
      return {
        day: row.day,
        count: Number(row.count),
      };
    });
    return data;
  },
  // TODO: make limit dynamic if needed
  async findMostPopularCategories() {
    const query = `SELECT ka.ad AS genre, COUNT(i.id) AS review_count
                      FROM incelemeler i
                      JOIN kitaplar k ON i.kitap_id = k.id
                      JOIN kategoriler ka ON k.kategori_id = ka.id
                      GROUP BY ka.ad
                      ORDER BY review_count DESC
                      LIMIT 5`;
    const result = await db.query(query);
    const data = result.rows.map((row) => {
      return {
        genre: row.genre,
        count: Number(row.review_count),
      };
    });
    return data;
  },
};
module.exports = reviewRepository;
