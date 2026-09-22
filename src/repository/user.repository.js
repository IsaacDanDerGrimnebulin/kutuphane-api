const db = require("../config/db");
const userRepository = {
  async findProfileByUserId(userId) {
    const query = `SELECT	u.id,
						              p.username,
                          p.first_name,
                          p.last_name,
                          p.bio,
                          p.avatar_url,
                          p.banner_url,
                          p.created_at,
                          p.birth_date,
                          COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS ortalama_puan,
                          COALESCE(COUNT(r.id), 0) AS yorum_sayisi
                        FROM users u
                        JOIN profiles p ON p.user_id = u.id
                        LEFT JOIN reviews r ON r.user_id = u.id
                        WHERE u.id = $1
                        GROUP BY
                          u.id,
                          p.id`;
    const result = await db.query(query, [userId]);
    const row = result.rows[0];

    if (!row) return null;

    return {
      userid: row.id,
      username: row.username,
      first_name: row.first_name,
      last_name: row.last_name,
      bio: row.bio,
      avatar_url: row.avatar_url,
      banner_url: row.banner_url,
      joinDate: row.created_at,
      birthDate: row.birth_date,
      reviewAvg: Number(row.ortalama_puan),
      reviewCount: Number(row.yorum_sayisi),
    };
  },
  // TODO: update function with new table names
  async exists(id) {
    const query = "SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)";
    const result = await db.query(query, [id]);
    return result.rows[0].exists;
  },
};
module.exports = userRepository;
