const { requireUser } = require("../middleware/auth");
const authService = require("../services/authService");
const database = require("../services/database");

async function register(ctx) {
  return {
    status: 201,
    body: authService.register(ctx.body)
  };
}

async function login(ctx) {
  return {
    status: 200,
    body: authService.login(ctx.body)
  };
}

async function me(ctx) {
  const user = requireUser(ctx);
  return {
    status: 200,
    body: {
      user: database.publicUser(user)
    }
  };
}

module.exports = {
  login,
  me,
  register
};
