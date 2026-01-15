const CustomError = require("../utils/customError");

const errorMiddleware = {
  routeNotFound(req, res, next) {
    const error = new CustomError(
      `Can't find ${req.originalUrl} on this server!`,
      404,
      "404_NOT_FOUND"
    );
    next(error);
  },
  errorHandler(err, req, res, next) {
    console.error("Hata Detayı: ", err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Sunucu taraflı bir hata oluştu.";

    res.status(statusCode).json({
      success: false,
      message: message,
      stack: process.env.NODE_ENV === "development" ? err.stack : null,
      errorType: err.errorType || "INTERNAL_SERVER_ERROR",
      data: err.data || null,
    });
  },
};

module.exports = errorMiddleware;
