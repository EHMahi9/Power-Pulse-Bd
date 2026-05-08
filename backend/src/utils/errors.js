class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

function assertOrThrow(condition, statusCode, message, details = null) {
  if (!condition) {
    throw new AppError(statusCode, message, details);
  }
}

module.exports = {
  AppError,
  assertOrThrow
};
