const jwt = require("jsonwebtoken");
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
        return res.status(401).json({
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
  authorize(allowedRoles) {
    return (req, res, next) => {
      // req.user, üstteki authenticate middleware'inden geliyor
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: "Bu işlem için yetkiniz bulunmuyor.",
          errorType: "AUTHORIZATION_ERROR",
          data: null,
        });
      }

      next(); // Yetki tamamsa bir sonraki fonksiyona geç
    };
  },
};
module.exports = authMiddleware;
