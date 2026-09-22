const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
exports.seed = async function (knex) {
  await knex("likes").del();
  await knex("reviews").del();
  await knex("books").del();
  await knex("profiles").del();
  await knex("authors").del();
  await knex("categories").del();
  await knex("users").del();

  // tüm şifreler 123456
  const hashedPassword = await bcrypt.hash("123456", 10);
  const categoryRows = [];
  for (let i = 1; i <= 10; i++) {
    categoryRows.push({
      id: nanoid(21),
      title: `Category-${i}`,
      slug: `category-${i}-slug`,
      description: `Category-${i} description`,
      is_active: true,
    });
  }

  await knex("categories").insert(categoryRows);

  // ----------------------------------------------------
  // 2. KULLANICILAR VE PROFİLLER
  // ----------------------------------------------------
  const userRows = [];
  const profileRows = [];
  const createdUserIds = [];

  for (let i = 1; i <= 50; i++) {
    const userId = nanoid(21);
    createdUserIds.push(userId);

    userRows.push({
      id: userId,
      email: `user_${i}@test.com`,
      password_hash: hashedPassword,
    });

    profileRows.push({
      id: nanoid(21),
      user_id: userId,
      username: `user_${i}`,
      first_name: `first_name_${i}`,
      last_name: `last_name_${i}`,
      bio: `Bu user_${i} kullanıcısının biyografisidir.`,
      avatar_url: "/profil-placeholder.png",
      banner_url: "/banner-placeholder.png",
      birth_date: `1976-08-10`,
    });
  }

  await knex("users").insert(userRows);
  await knex("profiles").insert(profileRows);
  // ----------------------------------------------------
  // 3. YAZARLAR
  // ----------------------------------------------------
  const authorRows = [];
  const createdAuthorIds = [];

  for (let i = 1; i <= 20; i++) {
    const authorId = nanoid(21);
    createdAuthorIds.push(authorId);

    authorRows.push({
      id: authorId,
      full_name: `Author-${i}`,
      slug: `author-${i}-slug`,
      bio: `Bu author_${i} kullanıcısının biyografisidir.`,
      born: `1945-01-0${i}`,
      die: `1984-01-0${i}`,
    });
  }
  await knex("authors").insert(authorRows);

  // ----------------------------------------------------
  // 4. KİTAPLAR (Loop ile 100 adet üret, yazar ve kategoriye rastgele bağlama)
  // ----------------------------------------------------
  const bookRows = [];
  const createdBookIds = [];

  for (let i = 1; i <= 100; i++) {
    const bookId = nanoid(21);
    createdBookIds.push(bookId);

    const randomAuthorId =
      createdAuthorIds[Math.floor(Math.random() * createdAuthorIds.length)];
    const randomCategory =
      categoryRows[Math.floor(Math.random() * categoryRows.length)];

    bookRows.push({
      id: bookId,
      author_id: randomAuthorId,
      category_id: randomCategory.id,
      title: `Book ${i}`,
      description: `Book ${i} description`,
      cover_url: "/book-placeholder.png",
    });
  }
  await knex("books").insert(bookRows);

  // ----------------------------------------------------
  // 5. İNCELEMELER (Reviews) (Rastgele kullanıcı ve kitap eşleştir)
  // ----------------------------------------------------
  const reviewRows = [];
  const createdReviewIds = [];
  const reviewPairs = new Set();

  let i = 1;
  while (i <= 100) {
    const randomUserId =
      createdUserIds[Math.floor(Math.random() * createdUserIds.length)];
    const randomBookId =
      createdBookIds[Math.floor(Math.random() * createdBookIds.length)];

    const reviewPairKey = `${randomUserId}-${randomBookId}`;

    if (!reviewPairs.has(reviewPairKey)) {
      reviewPairs.add(reviewPairKey);

      const reviewId = nanoid(21);
      createdReviewIds.push(reviewId);
      const randomRating = Math.floor(Math.random() * 5) + 1;

      reviewRows.push({
        id: reviewId,
        book_id: randomBookId,
        user_id: randomUserId,
        content: `Bu kitap hakkında yazılmış rastgele inceleme metni numarası ${i}.`,
        rating: randomRating,
      });

      i++;
    }
  }

  await knex("reviews").insert(reviewRows);

  // ----------------------------------------------------
  // 6. LIKES (Ara Tablo) (Rastgele kullanıcı ve inceleme eşleştir)
  // ----------------------------------------------------
  const likeRows = [];
  // Aynı kullanıcının aynı incelemeyi iki kez beğenmesini engellemek için Set
  const likedPairs = new Set();

  while (likeRows.length < 70) {
    const randomUserId =
      createdUserIds[Math.floor(Math.random() * createdUserIds.length)];
    const randomReviewId =
      createdReviewIds[Math.floor(Math.random() * createdReviewIds.length)];

    const pairKey = `${randomUserId}-${randomReviewId}`;

    if (!likedPairs.has(pairKey)) {
      likedPairs.add(pairKey);
      likeRows.push({
        user_id: randomUserId,
        review_id: randomReviewId,
      });
    }
  }

  await knex("likes").insert(likeRows);
  console.log("Seed başarıyla tamamlandı.");
};
