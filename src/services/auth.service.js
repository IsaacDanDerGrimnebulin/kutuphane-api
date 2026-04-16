const authRepository = require("../repository/auth.repository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isValidEmail } = require("../utils/customValidation");
const CustomError = require("../utils/customError");

const authService = {
  async register(email, password) {
    if (
      !password ||
      password.trim().length === 0 ||
      !email ||
      email.trim().length === 0
    ) {
      throw new CustomError(
        "Email veya şifre boş bırakılamaz",
        400,
        "NON_EMPTY_FIELD",
      );
    }
    if (!isValidEmail(email)) {
      throw new CustomError(
        "Yanlış email formatı",
        409,
        "INVALID_EMAIL_FORMAT",
      );
    }
    const password_hash = await bcrypt.hash(password, 10);
    const data = await authRepository.createUser(email, password_hash);
    if (!data) {
      throw new CustomError(
        "Kullanıcı oluşturulamadı.",
        400,
        "REGISTRATION_FAILED",
      );
    }
    return data;
  },
  async login(email, password) {
    if (
      !password ||
      password.trim().length === 0 ||
      !email ||
      email.trim().length === 0
    ) {
      throw new CustomError(
        "Email ve şifre boş bırakılamaz",
        400,
        "NON_EMPTY_FIELD",
      );
    }
    if (!isValidEmail(email)) {
      throw new CustomError(
        "Yanlış email formatı",
        409,
        "INVALID_EMAIL_FORMAT",
      );
    }
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      console.log("DEBUG: Kullanıcı e-postası bulunamadı."); // Sadece sen görürsün
      throw new CustomError(
        "E-posta veya şifre hatalı",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      throw new CustomError(
        "E-posta veya şifre hatalı",
        401,
        "INVALID_CREDENTIALS",
      );
    }
    const generatedToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token: generatedToken,
    };
  },
};
module.exports = authService;
