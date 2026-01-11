const authRepository = require("../repository/auth.repository");
const bcrypt = require("bcrypt");
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
};
module.exports = authService;
