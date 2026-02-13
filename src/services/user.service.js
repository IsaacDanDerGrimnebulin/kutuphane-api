const userRepository = require("../repository/user.repository");

const userService = {
  async getUserById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      return {
        errorType: "USER_NOT_FOUND",
        data: null,
      };
    }
    return {
      success: true,
      data: user,
    };
  },
  async getAllBookReviewedByUser(userId, queryParams) {
    const { q = "", page = 1, limit = 10 } = queryParams;

    const offset = (page - 1) * limit;

    // Repository fonksiyonlarını çağırıyoruz
    // Promise.all kullanarak ikisini aynı anda (paralel) çalıştırıyoruz
    const [books, totalCount] = await Promise.all([
      userRepository.findAllBookReviewedByUserId({ q }, limit, offset, userId),
      userRepository.countAllBookReviewedByUserId({ q }, userId),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      books: books,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
      },
    };
  },
  async getUserProfileByUserId(userId) {
    const user = await userRepository.findProfileByUserId(userId);

    if (!user) {
      return { errorType: "USER_NOT_FOUND", data: null };
    }

    return {
      data: user,
      errorType: null,
    };
  },
};
module.exports = userService;
