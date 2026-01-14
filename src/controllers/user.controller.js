const userService = require("../services/user.service");
const CustomError = require("../utils/customError");

const userController = {
  async getMe(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);
      if (user.errorType === "USER_NOT_FOUND") {
        throw new CustomError("Kullanıcı bulunamadı.", 404, "USER_NOT_FOUND");
      }

      res.status(200).json({
        success: true,
        message: "Kullancı verisi başarıyla getirildi",
        data: user.data,
      });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = userController;
