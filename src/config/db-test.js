const knex = require("knex");
const config = require("./constants");

const dbKnex = knex({
  client: "pg",
  connection: {
    user: config.db_test.user_test, // Varsayılan kullanıcı
    host: config.db_test.host_test, // Senin bilgisayarın
    database: config.db_test.database_test, // Oluşturduğun DB adı
    password: config.db_test.password_test, // Kurulumda belirlediğin şifre
    port: config.db_test.port_test, // Varsayılan Postgres portu
  },
  pool: {
    min: 2,
    max: 10,
    // Bağlantı kurulduğunda yapılacaklar (Eski pool.on gibi)
    afterCreate: (conn, done) => {
      console.log("PostgreSQL (Knex) bağlantısı başarıyla oluşturuldu.");
      done();
    },
  },
});
// Global hata yönetimi (Eski pool.error gibi)
dbKnex.on("query-error", (error, obj) => {
  console.error("Sorgu hatası veya bağlantı problemi:", error);
  // Eğer bağlantı tamamen koptuğunda uygulamayı kapatmak istersen:
  if (error.code === "ECONNREFUSED") process.exit(-1);
});
// Kapatma işini yapan fonksiyon
const closeDatabase = async () => {
  console.log("Veritabanı bağlantı havuzu boşaltılıyor...");
  try {
    await dbKnex.destroy();
    console.log("Veritabanı başarıyla kapatıldı.");
  } catch (error) {
    console.error("Veritabanı kapatılırken hata oluştu:", error);
    throw error;
  }
};
module.exports = {
  db: dbKnex,
  closeDatabase,
};
