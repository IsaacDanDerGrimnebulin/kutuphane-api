const authRepository = require("../repository/auth.repository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authService = {
  async register(kullanici_adi, email, password) {
    // hashing
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await authRepository.createUser(
      kullanici_adi,
      email,
      password_hash
    );
    if (!newUser) {
      return {
        errorType: "REGISTRATION_FAILED",
        data: null,
      };
    }
    return {
      errorType: null,
      data: newUser,
    };
  },
  async login(email, password) {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      console.log("DEBUG: Kullanıcı e-postası bulunamadı."); // Sadece sen görürsün
      return {
        success: false,
        errorType: "INVALID_CREDENTIALS",
        message: "E-posta veya şifre hatalı",
      };
    }
    // Şifreyi kontrol et.
    const passwordMatch = await bcrypt.compareSync(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      console.log("DEBUG: Şifre eşleşmedi."); // Sadece sen görürsün
      return {
        success: false,
        errorType: "INVALID_CREDENTIALS",
        message: "E-posta veya şifre hatalı",
      };
    }
    const generatedToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token: generatedToken, // Buraya da JWT gelecek
    };
  },
};
module.exports = authService;
