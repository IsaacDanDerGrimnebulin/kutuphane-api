const { Pool } = require("pg");
const config = require("./constants");
// Bağlantı bilgileri
/* const pool = new Pool({
  user: config.db.user, // Varsayılan kullanıcı
  host: config.db.host, // Senin bilgisayarın
  database: config.db.database, // Oluşturduğun DB adı
  password: config.db.password, // Kurulumda belirlediğin şifre
  port: config.db.port, // Varsayılan Postgres portu
}); */

const poolTest = new Pool({
  user: config.db_test.user_test, // Varsayılan kullanıcı
  host: config.db_test.host_test, // Senin bilgisayarın
  database: config.db_test.database_test, // Oluşturduğun DB adı
  password: config.db_test.password_test, // Kurulumda belirlediğin şifre
  port: config.db_test.port_test,
});

// Bağlantı testi
poolTest.on("connect", () => {
  console.log("PostgreSQL veritabanına başarıyla bağlanıldı.");
});
// Mevcut bağlantı testinin altına ekleyebilirsin
poolTest.on("error", (err) => {
  console.error("Beklenmedik veritabanı hatası!", err);
  process.exit(-1); // Ciddi bir hata varsa uygulamayı güvenli kapatır
});

module.exports = {
  query: (text, params) => poolTest.query(text, params),
};
