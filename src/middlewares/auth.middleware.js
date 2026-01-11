const jwt = require("jsonwebtoken");
require("dotenv").config();
const authMiddleware = {
  authenticateToken(req, res, next) {
    // Header'dan token'ı al (Format: Bearer <token>)
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token bulunamadı.",
        errorType: "AUTHENTICATION_ERROR",
        data: null,
      });
    }

    // Token doğrulama
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: "Geçersiz veya süresi dolmuş token.",
          errorType: "AUTHENTICATION_ERROR",
          data: null,
        });
      }

      // Token geçerliyse kullanıcı bilgilerini isteğe ekle
      req.user = user;
      next(); // Bir sonraki fonksiyona (Dashboard rotasına) geç
    });
  },
};
module.exports = authMiddleware;
