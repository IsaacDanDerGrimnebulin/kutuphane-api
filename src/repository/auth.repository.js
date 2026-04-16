const db = require("../config/db");
const { nanoid } = require("nanoid");
const authRepository = {
  async createUser(email, password) {
    const id = nanoid();
    const query = `INSERT INTO users(id,email,password_hash)
      VALUES ($1,$2,$3)
      RETURNING id, email, created_at`;
    const values = [id, email, password];
    const result = await db.query(query, values);
    const row = result.rows[0];

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      created_at: row.created_at,
    };
  },
  async findUserByEmail(email) {
    const query = `SELECT id, email, password_hash, role 
                    FROM users
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
