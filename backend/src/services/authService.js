const env = require("../config/env");
const database = require("./database");
const { AppError, assertOrThrow } = require("../utils/errors");
const { hashPassword, signToken, verifyPassword, verifyToken } = require("../utils/security");
const { cleanString, isEmail, normalizeEmail, passwordProblems } = require("../utils/validation");

function issueSession(user) {
  const publicProfile = database.publicUser(user);
  const token = signToken(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    },
    env.jwtSecret,
    env.tokenTtlSeconds
  );

  return {
    token,
    user: publicProfile
  };
}

function register({ name, email, password }) {
  const safeName = cleanString(name, 80);
  const safeEmail = normalizeEmail(email);
  const problems = passwordProblems(password);

  assertOrThrow(safeName.length >= 2, 400, "Name must be at least 2 characters.");
  assertOrThrow(isEmail(safeEmail), 400, "Use a valid email address.");
  assertOrThrow(problems.length === 0, 400, "Password is not strong enough.", problems);

  return database.transaction((data) => {
    const exists = data.users.some((user) => user.email === safeEmail);
    assertOrThrow(!exists, 409, "An account already exists for this email.");

    const user = {
      id: database.nextId(data, "users", "u"),
      name: safeName,
      email: safeEmail,
      passwordHash: hashPassword(password),
      role: "user",
      createdAt: new Date().toISOString()
    };

    data.users.push(user);
    return issueSession(user);
  });
}

function login({ email, password }) {
  const safeEmail = normalizeEmail(email);
  assertOrThrow(isEmail(safeEmail), 400, "Use a valid email address.");

  const data = database.readDatabase();
  const user = data.users.find((item) => item.email === safeEmail);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new AppError(401, "Email or password is incorrect.");
  }

  return issueSession(user);
}

function getUserFromToken(token) {
  const payload = verifyToken(token, env.jwtSecret);
  if (!payload || !payload.sub) {
    return null;
  }

  const data = database.readDatabase();
  return data.users.find((user) => user.id === payload.sub) || null;
}

module.exports = {
  getUserFromToken,
  login,
  register
};
