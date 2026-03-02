const authRepository = require("../repository/auth.repository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isValidEmail } = require("../utils/customValidation");

const authService = {
  async register(kullanici_adi, email, password) {
    // hashing

    if (
      !password ||
      password.trim().length === 0 ||
      !kullanici_adi ||
      kullanici_adi.trim().length === 0 ||
      !email ||
      email.trim().length === 0
    ) {
      return {
        errorType: "NON_EMPTY_FIELD",
        data: null,
      };
    }
    if (kullanici_adi.trim().length < 3) {
      return {
        errorType: "MIN_LENGTH_REQUIRED",
        data: null,
      };
    }
    if (!isValidEmail(email)) {
      return {
        errorType: "INVALID_EMAIL_FORMAT",
        data: null,
      };
    }
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = await authRepository.createUser(
      kullanici_adi,
      email,
      password_hash,
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
    if (
      !password ||
      password.trim().length === 0 ||
      !email ||
      email.trim().length === 0
    ) {
      return {
        errorType: "NON_EMPTY_FIELD",
        data: null,
      };
    }
    if (!isValidEmail(email)) {
      return {
        errorType: "INVALID_EMAIL_FORMAT",
        data: null,
      };
    }
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      console.log("DEBUG: Kullanıcı e-postası bulunamadı."); // Sadece sen görürsün
      return {
        errorType: "INVALID_CREDENTIALS",
        data: null,
      };
    }
    // Şifreyi kontrol et.
    const passwordMatch = await bcrypt.compareSync(
      password,
      user.password_hash,
    );

    if (!passwordMatch) {
      console.log("DEBUG: Şifre eşleşmedi."); // Sadece sen görürsün
      return {
        errorType: "INVALID_CREDENTIALS",
        data: null,
      };
    }
    const generatedToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token: generatedToken, // Buraya da JWT gelecek
    };
  },
};
module.exports = authService;
