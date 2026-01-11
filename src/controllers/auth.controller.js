const authService = require("../services/auth.service");

const authController = {
  async register(req, res) {
    try {
      const { kullanici_adi, email, sifre } = req.body;
      if (!sifre || sifre.trim().length === 0) {
        return res.status(400).json({
          success: false,
          errorType: "VALIDATION_ERROR",
          message: "Şifre boş bırakılamaz.",
        });
      }
      const result = await authService.register(kullanici_adi, email, sifre);

      if (result.errorType === "REGISTRATION_FAILED") {
        return res.status(400).json({
          success: false,
          errorType: "REGISTRATION_FAILED",
          message: "Kullanıcı oluşturulamadı.",
        });
      }

      res.status(201).json({
        success: true,
        message: "Kullanıcı başarıyla katıt oldu.",
        data: result.data,
      });
    } catch (error) {
      console.log("ERROR: ", error);
      // Eğer DB'den UNIQUE kısıtlaması hatası gelirse (örn: email zaten var)
      if (error.code === "23505") {
        res
          .status(409)
          .json({ success: false, errorType: "ALREADY_EXISTS", data: null });
      }
      res
        .status(500)
        .json({ success: false, message: "INTERNAL_ERROR!", data: null });
    }
  },
  async login(req, res) {
    try {
      const { email, sifre } = req.body;
      if (!sifre || sifre.trim().length === 0) {
        return res.status(400).json({
          success: false,
          errorType: "VALIDATION_ERROR",
          message: "Şifre boş bırakılamaz.",
          data: null,
        });
      } else if (!email || email.trim().length === 0) {
        return res.status(400).json({
          success: false,
          errorType: "VALIDATION_ERROR",
          message: "Email boş bırakılamaz.",
          data: null,
        });
      }
      const user = await authService.login(email, sifre);

      if (user.errorType === "INVALID_CREDENTIALS") {
        return res.status(401).json({
          success: false,
          errorType: "INVALID_CREDENTIALS",
          message: "E-posta veya şifre hatalı",
          data: null,
        });
      }
      res.status(200).json({
        success: true,
        message: "Kullanıcı başarıyla giriş yaptı.",
        data: user.data,
        token: user.token,
      });
    } catch (error) {
      console.log("ERROR: ", error);
      res
        .status(500)
        .json({ success: false, message: "INTERNAL_ERROR!", data: null });
    }
  },
};
module.exports = authController;
