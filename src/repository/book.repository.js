const db = require("../config/db");

const bookRepository = {
  // Tek bir kitabı tüm detaylarıyla getirir
  // TODO: remove fiyat columns
  async findById(id) {
    const query = `
             SELECT 
                  k.id AS kitap_id, 
                  k.kitap_adi, 
                  k.fiyat, 
                  y.id AS yazar_id, 
                  y.yazar_adi,
                  kat.id AS kategori_id,
                  kat.ad AS kategori_adi,
                  kat.slug AS kategori_slug,
				      COALESCE(ROUND(AVG(i.puan)::numeric, 2), 0) AS ortalama_puan,
              COALESCE( COUNT(i.id), 0) AS yorum_sayisi
              FROM kitaplar k
              JOIN yazarlar y ON k.yazar_id = y.id
              JOIN kategoriler kat ON k.kategori_id = kat.id
			        LEFT JOIN incelemeler i ON k.id = i.kitap_id
			        WHERE k.id = $1
			        GROUP BY k.id,y.id,kat.id`;
    const result = await db.query(query, [id]);
    const row = result.rows[0];
    if (!row) return null;
    const resultDAL = {
      id: row.kitap_id, // Artık k.id ile çakışmıyor!
      kitap_adi: row.kitap_adi,
      ortalama_puan: Number(row.ortalama_puan),
      yorum_sayisi: Number(row.yorum_sayisi),
      yazar: {
        id: row.yazar_id, // y.id'den gelen değer
        ad: row.yazar_adi,
      },
      kategori: {
        id: row.kategori_id, // y.id'den gelen değer
        ad: row.kategori_adi,
        slug: row.kategori_slug,
      },
    };
    return resultDAL;
  },
  async findAll(filters, limit, offset) {
    const query = `SELECT 
                   k.id AS kitap_id, 
                   k.kitap_adi, 
                   k.fiyat, 
                   y.id AS yazar_id, 
                   y.yazar_adi,
                   kat.id AS kategori_id,
                   kat.ad AS kategori_adi,
                   kat.slug AS kategori_slug,
				   COALESCE(ROUND(AVG(i.puan)::numeric, 2), 0) AS ortalama_puan,
				  COALESCE( COUNT(i.id), 0) AS yorum_sayisi
                  FROM kitaplar k 
                  JOIN yazarlar y ON k.yazar_id = y.id 
                  JOIN kategoriler kat ON k.kategori_id = kat.id
				  LEFT JOIN incelemeler i ON k.id = i.kitap_id
                  WHERE k.kitap_adi ILIKE $1
				  GROUP BY k.id,y.id,kat.id,kat.id
                  LIMIT $2 OFFSET $3`;
    const result = await db.query(query, [`${filters.q}%`, limit, offset]);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.kitap_id, // Artık k.id ile çakışmıyor!
        kitap_adi: row.kitap_adi,
        ortalama_puan: Number(row.ortalama_puan),
        yorum_sayisi: Number(row.yorum_sayisi),
        yazar: {
          id: row.yazar_id, // y.id'den gelen değer
          ad: row.yazar_adi,
        },
        kategori: {
          id: row.kategori_id, // y.id'den gelen değer
          ad: row.kategori_adi,
          slug: row.kategori_slug,
        },
      };
    });

    return resultDAL;
  },
  // 2. Toplam sayıyı getiren sorgu
  async countAll(filters) {
    const query = `SELECT COUNT(*) FROM kitaplar WHERE kitap_adi ILIKE $1`;
    const values = [`${filters.q}%`];
    const result = await db.query(query, values);
    return Number(result.rows[0].count);
  },
  async exists(id) {
    const query = "SELECT EXISTS(SELECT 1 FROM kitaplar WHERE id = $1)";
    const result = await db.query(query, [id]);
    return result.rows[0].exists; // true veya false döner
  },
  async findReviewedByUser(userId, limit, offset) {
    const query = `SELECT 
                  k.id AS kitap_id, 
                  k.kitap_adi,
                   k.cover_url,
                  (SELECT ROUND(AVG(puan)::numeric, 2) 
                  FROM incelemeler 
                  WHERE kitap_id = k.id) AS genel_ortalama_puan
              FROM incelemeler i 
              JOIN kitaplar k ON i.kitap_id = k.id 
              WHERE i.kullanici_id = $1
              ORDER BY i.tarih DESC
              LIMIT $2 OFFSET $3`;
    const result = await db.query(query, [userId, limit, offset]);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.kitap_id,
        kitap_adi: row.kitap_adi,
        cover_url: row.cover_url,
        ortalama_puan: Number(row.genel_ortalama_puan),
      };
    });
    return resultDAL;
  },
  async findCountReviewedByUser(userId) {
    const query = `SELECT COUNT(*) FROM incelemeler i 
                      JOIN  kitaplar k ON i.kitap_id = k.id
                      WHERE i.kullanici_id=$1`;
    const result = await db.query(query, [userId]);
    return Number(result.rows[0].count);
  },
  async total() {
    const query = `SELECT COUNT(*) FROM kitaplar`;
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
