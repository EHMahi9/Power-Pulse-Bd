const { AppError } = require("../utils/errors");
const authService = require("../services/authService");

function optionalUser(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return authService.getUserFromToken(token);
}

function requireUser(ctx) {
  if (!ctx.user) {
    throw new AppError(401, "Login is required.");
  }

  return ctx.user;
}

function requireAdmin(ctx) {
  const user = requireUser(ctx);
  if (user.role !== "admin") {
    throw new AppError(403, "Admin access is required.");
  }

  return user;
}

module.exports = {
  optionalUser,
  requireAdmin,
  requireUser
};
