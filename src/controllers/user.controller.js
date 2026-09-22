const userService = require("../services/user.service");
const CustomError = require("../utils/customError");

const userController = {
  async getUserProfileByUserId(req, res, next) {
    try {
      const ownerId = req.user.id;
      const reqId = req.params.id;

      const user = await userService.getUserProfileByUserId(reqId);

      const isOwner = String(ownerId) === String(reqId);
      res.status(200).json({
        success: true,
        message: "Kullanıcı profili başarıyla getirildi",
        data: user,
        isOwner: isOwner,
      });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = userController;
