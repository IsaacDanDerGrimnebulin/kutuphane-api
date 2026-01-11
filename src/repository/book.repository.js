const db = require("../config/db");
/**
 * 4. Repository / DAL Katmanı (Veri Kaynağı)
 *  Görevi: Sadece veritabanı ile konuşur.
 *  SQL sorgularını yazar.
 *  Veritabanından gelen ham satırları (rows) alır.
 *  Genelde "Mapping" (az önce konuştuğumuz objeye dönüştürme) işlemini burada veya küçük bir yardımcı fonksiyonda yapar.
 */
const bookRepository = {
  // Tek bir kitabı tüm detaylarıyla getirir

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
                  kat.slug AS kategori_slug
              FROM kitaplar k
              JOIN yazarlar y ON k.yazar_id = y.id
              JOIN kategoriler kat ON k.kategori_id = kat.id
              WHERE k.id = $1`;
    const result = await db.query(query, [id]);
    const row = result.rows[0];
    if (!row) return null;
    const resultDAL = {
      id: row.kitap_id, // Artık k.id ile çakışmıyor!
      kitap_adi: row.kitap_adi,
      fiyat: Number(row.fiyat),
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
                   kat.slug AS kategori_slug
                  FROM kitaplar k 
                  JOIN yazarlar y ON k.yazar_id = y.id 
                  JOIN kategoriler kat ON k.kategori_id = kat.id
                  WHERE k.kitap_adi ILIKE $1
                  LIMIT $2 OFFSET $3`;
    const result = await db.query(query, [`${filters.q}%`, limit, offset]);
    const resultDAL = result.rows.map((row) => {
      return {
        id: row.kitap_id, // Artık k.id ile çakışmıyor!
        kitap_adi: row.kitap_adi,
        fiyat: Number(row.fiyat),
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
};

module.exports = bookRepository;
