const userService = require("../services/user.service");

const userController = {
  async getMe(req, res) {
    try {
      const user = await userService.getUserById(req.user.id);
      if (user.errorType === "USER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          errorType: "USER_NOT_FOUND",
          message: "Kullanıcı bulunamadı.",
          data: null,
        });
      }

      res.status(200).json({
        success: true,
        message: "Kullancı verisi başarıyla getirildi",
        data: user.data,
      });
    } catch (error) {
      console.log("ERROR: ", error);
      res.status(500).json({
        success: false,
        message: "INTERNAL_ERROR!",
        data: null,
      });
    }
  },
};
module.exports = userController;
