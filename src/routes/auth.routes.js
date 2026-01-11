const express = require("express");
const router = express.Router({ mergeParams: true }); // :bookId parametresini üstten almak için şart
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);
module.exports = router;
