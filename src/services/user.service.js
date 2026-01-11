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
};
module.exports = userService;
