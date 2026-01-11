const db = require("../config/db");
const authRepository = {
  async createUser(username, email, sifre) {
    const query = `INSERT INTO kullanicilar(kullanici_adi,email,password_hash)
      VALUES ($1,$2,$3)
      RETURNING id, kullanici_adi, email, created_at`;
    const values = [username, email, sifre];
    const result = await db.query(query, values);
    const row = result.rows[0];

    if (!row) return null;

    return {
      id: row.id,
      username: row.kullanici_adi,
      email: row.email,
      created_at: row.created_at,
    };
  },
};

module.exports = authRepository;
