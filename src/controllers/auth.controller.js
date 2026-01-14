const authService = require("../services/auth.service");
const CustomError = require("../utils/customError");

const authController = {
  async register(req, res, next) {
    try {
      const { kullanici_adi, email, sifre } = req.body;
      const result = await authService.register(kullanici_adi, email, sifre);
      if (result.errorType === "NON_EMPTY_FIELD") {
        throw new CustomError(
          "Kullanıcı adı, şifre ve email boş bırakılamaz",
          400,
          "NON_EMPTY_FIELD"
        );
      }
      if (result.errorType === "MIN_LENGTH_REQUIRED") {
        throw new CustomError(
          "Kullanıcı adı minimum 3 karatere sahip olmalı",
          400,
          "MIN_LENGTH_REQUIRED"
        );
      }
      if (result.errorType === "INVALID_EMAIL_FORMAT") {
        throw new CustomError(
          "Yanlış email formatı",
          409,
          "INVALID_EMAIL_FORMAT"
        );
      }

      if (result.errorType === "REGISTRATION_FAILED") {
        throw new CustomError(
          "Kullanıcı oluşturulamadı.",
          400,
          "REGISTRATION_FAILED"
        );
      }

      res.status(201).json({
        success: true,
        message: "Kullanıcı başarıyla kayıt oldu.",
        data: result.data,
      });
    } catch (error) {
      console.log("ERROR: ", error);

      // Eğer DB'den UNIQUE kısıtlaması hatası gelirse (örn: email zaten var)
      if (error.code === "23505") {
        throw new CustomError(
          "Bu kullanıcı adı veya email ile kayıt olamazsınız",
          409,
          "ALREADY_EXISTS"
        );
      }
      next(error);
    }
  },
  async login(req, res, next) {
    try {
      const { email, sifre } = req.body;

      const user = await authService.login(email, sifre);
      if (user.errorType === "NON_EMPTY_FIELD") {
        throw new CustomError(
          "Email ve şifre boş bırakılamaz",
          400,
          "NON_EMPTY_FIELD"
        );
      }
      if (user.errorType === "INVALID_EMAIL_FORMAT") {
        throw new CustomError(
          "Yanlış email formatı",
          409,
          "INVALID_EMAIL_FORMAT"
        );
      }
      if (user.errorType === "INVALID_CREDENTIALS") {
        throw new CustomError(
          "E-posta veya şifre hatalı",
          401,
          "INVALID_CREDENTIALS"
        );
      }
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
