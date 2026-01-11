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
};
module.exports = userRepository;
