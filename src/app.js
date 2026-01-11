const express = require("express");
const config = require("./config/constants");
const app = express();
const bookRoutes = require("./routes/book.routes");
const reviewRoutes = require("./routes/review.routes");
app.use(express.json());
/* app.post("/add-book", async (req, res) => {
  try {
    const { kitap_adi, yazar } = req.body;

    const query =
      "INSERT INTO kitaplar (kitap_adi, yazar) VALUES ($1, $2) RETURNING *";
    const values = [kitap_adi, yazar];

    const result = await db.query(query, values);

    res
      .status(201)
      .json({ message: "Kitap başarıyla eklendi.", book: result.rows[0] });
  } catch (err) {
    console.error("Bir şeyler ters gitti: ", err.message);
    res.status(500).json({ error: err.message });
  }
}); */

/* app.get("/books/all", async (req, res) => {
  try {
    const query = "SELECT * FROM kitaplar";
    const result = await db.query(query);
    res.status(200).json({ count: result.rowCount, books: result.rows });
  } catch (err) {
    console.log("Bir şeyler ters gitti", err.message);
    res.status(500).json({ message: err.message });
  }
});
 */
/* app.get("/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const query = `
              SELECT 
                  k.id AS kitap_id, 
                  k.kitap_adi, 
                  k.fiyat, 
                  y.id AS yazar_id, 
                  y.yazar_adi 
              FROM kitaplar k
              JOIN yazarlar y ON k.yazar_id = y.id
              WHERE k.id = $1`;

    const values = [id];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kitap bulunamadı!" });
    }
    const row = result.rows[0];

    const resultDAL = {
      id: row.kitap_id, // Artık k.id ile çakışmıyor!
      kitap_adi: row.kitap_adi,
      fiyat: row.fiyat,
      yazar: {
        id: row.yazar_id, // y.id'den gelen değer
        ad: row.yazar_adi,
      },
    };
    res.status(200).json(resultDAL);
  } catch (err) {
    console.log("Hata.", err.message);
    res.status(500).json({ message: err.message });
  }
}); */
// DELETE NEED TO UPDATE
/* app.delete("/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const query = "DELETE FROM kitaplar WHERE id = $1 RETURNING *";
    const result = await db.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Böyle bir kitap yok ki!" });
    }
    res
      .status(200)
      .json({ message: "Başarıyla silindi", book: result.rows[0] });
  } catch (err) {
    console.log("Hata.", err.message);
    res.status(500).json({ message: err.message });
  }
}); */
// UPDATE NEED TO UPDATE
/* app.patch("/books/:id", async (req, res) => {
  try {
    const { kitap_adi, yazar } = req.body;
    const id = req.params.id;

    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "Güncellenecek hiçbir veri gönderilmedi!" });
    }
    const baseBookQuery = "SELECT * FROM kitaplar WHERE id = $1";

    const baseBookResult = await db.query(baseBookQuery, [id]);

    if (baseBookResult.rowCount === 0) {
      return res.status(404).json({ message: "Böyle bir kitap yok ki!" });
    }

    const newBookName = kitap_adi || baseBookResult.rows[0].kitap_adi;
    const newBookAuthor = yazar || baseBookResult.rows[0].yazar;

    const updateQuery =
      "UPDATE kitaplar SET kitap_adi = $1, yazar = $2 WHERE id = $3 RETURNING *";
    const updateResult = await db.query(updateQuery, [
      newBookName,
      newBookAuthor,
      id,
    ]);

    res
      .status(200)
      .json({ message: "Güncelleme başarılı", updated: updateResult.rows[0] });
  } catch (err) {
    console.error("Hata", err.message);
    res.status(500).json({ message: err.message });
  }
}); */
// ADD
/* app.post("/add-book", async (req, res) => {
  try {
    const { kitap_adi, fiyat, mevcut_mu, yazar_id } = req.body;

    // KONTROL 1: YAZAR MEVCUT MU?
    const authorExists = await db.query(
      "SELECT 1 FROM yazarlar WHERE id = $1",
      [yazar_id]
    );

    if (authorExists.rowCount === 0) {
      return res.status(404).json({ message: "Geçersiz yazar seçimi." });
    }
    // Kitap Ekle
    const query =
      "INSERT INTO kitaplar(kitap_adi,fiyat,mevcut_mu,yazar_id) VALUES ($1,$2,$3,$4) RETURNING *";
    const values = [kitap_adi, fiyat, mevcut_mu, yazar_id];

    const result = await db.query(query, values);

    res
      .status(201)
      .json({ message: "Kitap başarıyla eklendi.", book: result.rows[0] });
  } catch (err) {
    console.log("Veritabanı hatası.", err.stack);
    res.status(500).json({ error: "Sunucu tarafında bir hata oluştu." });
  }
}); */
// SEARCH NEED TO UPDATE
/* app.get("/books", async (req, res) => {
  try {
    const { search } = req.query; // body, params.id 'den farklı
    let query = `SELECT k.*, y.yazar_adi
                    FROM kitaplar k
                    JOIN yazarlar y 
                    ON k.yazar_id = y.id
                    `;
    const params = [];
    if (search) {
      query += `WHERE k.kitap_adi ILIKE $1`;
      params.push(`${search}%`);
    }
    const result = await db.query(query, params);

    res.status(200).json({ count: result.rowCount, books: result.rows });
  } catch (err) {
    console.log("Sunucu hatası.", err.stack);
    res.status(500).json({ error: "Sunucu tarafında bir hata oluştu." });
  }
}); */

app.use("/books", bookRoutes);
app.use("/reviews", reviewRoutes); // <--- Bunu ekle
app.listen(config.port, () => console.log("5000 portu yanıyor!"));
