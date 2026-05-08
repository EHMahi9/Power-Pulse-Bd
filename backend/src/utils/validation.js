const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value, maxLength = 200) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeEmail(value) {
  return cleanString(value, 120).toLowerCase();
}

function isEmail(value) {
  return emailPattern.test(normalizeEmail(value));
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampNumber(value, min, max, fallback = min) {
  const parsed = parseNumber(value, fallback);
  return Math.min(max, Math.max(min, parsed));
}

function passwordProblems(password) {
  const value = String(password || "");
  const problems = [];

  if (value.length < 8) {
    problems.push("Use at least 8 characters.");
  }
  if (!/[a-z]/.test(value)) {
    problems.push("Add a lowercase letter.");
  }
  if (!/[A-Z]/.test(value)) {
    problems.push("Add an uppercase letter.");
  }
  if (!/[0-9]/.test(value)) {
    problems.push("Add a number.");
  }

  return problems;
}

module.exports = {
  cleanString,
  clampNumber,
  isEmail,
  normalizeEmail,
  parseNumber,
  passwordProblems
};
