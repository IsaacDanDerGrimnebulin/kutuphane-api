const userRepository = require("../repository/user.repository");
const CustomError = require("../utils/customError");

const userService = {
  async getUserProfileByUserId(userId) {
    const user = await userRepository.findProfileByUserId(userId);

    if (!user) {
      throw new CustomError(
        "Kullanıcı profili bulunamadı.",
        404,
        "AUTHOR_NOT_FOUND",
      );
    }
    return user;
  },
};
module.exports = userService;
