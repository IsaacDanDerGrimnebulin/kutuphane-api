// utils/customError.js
class CustomError extends Error {
  constructor(message, statusCode, errorType, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.data = data;
  }
}
module.exports = CustomError;
