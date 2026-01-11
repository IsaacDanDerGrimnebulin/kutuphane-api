const { Pool } = require("pg");
const config = require("./constants");
// Bağlantı bilgileri
const pool = new Pool({
  user: config.db.user, // Varsayılan kullanıcı
  host: config.db.host, // Senin bilgisayarın
  database: config.db.database, // Oluşturduğun DB adı
  password: config.db.password, // Kurulumda belirlediğin şifre
  port: config.db.port, // Varsayılan Postgres portu
});

// Bağlantı testi
pool.on("connect", () => {
  console.log("PostgreSQL veritabanına başarıyla bağlanıldı.");
});
// Mevcut bağlantı testinin altına ekleyebilirsin
pool.on("error", (err) => {
  console.error("Beklenmedik veritabanı hatası!", err);
  process.exit(-1); // Ciddi bir hata varsa uygulamayı güvenli kapatır
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
