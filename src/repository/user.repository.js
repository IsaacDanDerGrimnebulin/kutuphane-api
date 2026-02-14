const db = require("../config/db");
const userRepository = {
  async findById(id) {
    const query = `SELECT id, kullanici_adi, email, created_at
                   FROM kullanicilar WHERE id = $1`;
    const result = await db.query(query, [id]);
    const row = result.rows[0];

    if (!row) return null;

    return {
      id: row.id,
      username: row.kullanici_adi,
      email: row.email,
      created_at: row.created_at,
    };
  },
  async findAllBookReviewedByUserId(filters, limit, offset, userId) {
    const query = `SELECT 
                    k.id AS kitap_id, 
                    k.kitap_adi, 
                    y.id AS yazar_id, 
                    y.yazar_adi,
                    kat.id AS kategori_id,
                    kat.ad AS kategori_adi,
                    kat.slug AS kategori_slug,
                    stats.yorum_sayisi,
                    stats.ortalama_puan
                  FROM incelemeler i 
                  JOIN kitaplar k ON k.id = i.kitap_id
                  JOIN yazarlar y ON k.yazar_id = y.id 
                  JOIN kategoriler kat ON k.kategori_id = kat.id
                  -- Kitap bazlı genel istatistikleri getiren join:
                  LEFT JOIN (
                      SELECT 
                          kitap_id, 
                          COALESCE( COUNT(id), 0) AS yorum_sayisi, 
                          COALESCE(ROUND(AVG(puan)::numeric, 2), 0) AS ortalama_puan 
                      FROM incelemeler
                      GROUP BY kitap_id
                  ) stats ON stats.kitap_id = k.id
                  WHERE k.kitap_adi ILIKE $1 AND i.kullanici_id = $2
                  GROUP BY k.id, y.id, kat.id, stats.yorum_sayisi, stats.ortalama_puan
                  LIMIT $3 OFFSET $4`;
    const result = await db.query(query, [
      `${filters.q}%`,
      userId,
      limit,
      offset,
    ]);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.kitap_id,
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
  async countAllBookReviewedByUserId(filters, userId) {
    const query = `SELECT COUNT(DISTINCT k.id)
                          FROM incelemeler i
                          JOIN kitaplar k ON k.id = i.kitap_id
                          WHERE kitap_adi ILIKE $1 AND i.kullanici_id = $2`;
    const values = [`${filters.q}%`, userId];
    const result = await db.query(query, values);
    return Number(result.rows[0].count);
  },
  async findProfileByUserId(userId) {
    const query = `SELECT k.id,k.kullanici_adi,
                          p.ad,
                          p.soyad,
                          p.bio,
                          p.avatar_url,
                          p.banner_url,
                          k.created_at,
                          p.dogum_tarihi,
                          COALESCE(ROUND(AVG(i.puan)::numeric, 2), 0) AS ortalama_puan,
                          COALESCE(COUNT(i.id), 0) AS yorum_sayisi
                        FROM kullanicilar k
                        JOIN profil p ON p.kullanici_id = k.id
                        LEFT JOIN incelemeler i ON i.kullanici_id = k.id
                        WHERE k.id = $1
                        GROUP BY
                          k.id,
                          p.id`;
    const result = await db.query(query, [userId]);
    const row = result.rows[0];

    if (!row) return null;

    return {
      userid: row.id,
      username: row.kullanici_adi,
      first_name: row.ad,
      last_name: row.soyad,
      bio: row.bio,
      avatar_url: row.avatar_url,
      banner_url: row.banner_url,
      joinDate: row.created_at,
      birthDate: row.dogum_tarihi,
      reviewAvg: row.ortalama_puan,
      reviewCount: row.yorum_sayisi,
    };
  },
  async exists(id) {
    const query = "SELECT EXISTS(SELECT 1 FROM kullanicilar WHERE id = $1)";
    const result = await db.query(query, [id]);
    return result.rows[0].exists;
  },
};
module.exports = userRepository;
