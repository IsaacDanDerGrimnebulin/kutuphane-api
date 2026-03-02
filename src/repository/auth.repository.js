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
  async findUserByEmail(email) {
    const query = `SELECT id, kullanici_adi, email, password_hash,role 
                    FROM kullanicilar
                    WHERE email = $1`;
    const result = await db.query(query, [email]);
    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      username: row.kullanici_adi,
      email: row.email,
      password_hash: row.password_hash,
      role: row.role,
    };
  },
};

module.exports = authRepository;
