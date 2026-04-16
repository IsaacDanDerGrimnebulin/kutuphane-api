const authService = require("../services/auth.service");
const CustomError = require("../utils/customError");

const authController = {
  async register(req, res, next) {
    try {
      const { email, sifre } = req.body;
      const result = await authService.register(email, sifre);

      res.status(201).json({
        success: true,
        message: "Kullanıcı başarıyla kayıt oldu.",
        data: result,
      });
    } catch (error) {
      console.log("ERROR: ", error);

      // Eğer DB'den UNIQUE kısıtlaması hatası gelirse (örn: email zaten var)
      if (error.code === "23505") {
        throw new CustomError(
          "Bu kullanıcı adı veya email ile kayıt olamazsınız",
          409,
          "ALREADY_EXISTS",
        );
      }
      next(error);
    }
  },
  async login(req, res, next) {
    try {
      const { email, sifre } = req.body;

      const user = await authService.login(email, sifre);

      res.status(200).json({
        success: true,
        message: "Kullanıcı başarıyla giriş yaptı.",
        data: user.data,
        token: user.token,
      });
    } catch (error) {
      next(error);
    }
  },
};
module.exports = authController;
