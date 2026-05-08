const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const BACKEND_DIR = path.join(PROJECT_ROOT, "backend");
const FRONTEND_DIR = path.join(PROJECT_ROOT, "frontend");

module.exports = {
  projectRoot: PROJECT_ROOT,
  backendDir: BACKEND_DIR,
  frontendDir: FRONTEND_DIR,
  dataFile:
    process.env.POWERPULSE_DATA_FILE || path.join(BACKEND_DIR, "data", "powerpulse.db.json"),
  port: Number(process.env.PORT || 4200),
  jwtSecret:
    process.env.POWERPULSE_JWT_SECRET ||
    "dev-only-powerpulse-secret-change-before-deployment",
  tokenTtlSeconds: Number(process.env.POWERPULSE_TOKEN_TTL_SECONDS || 60 * 60 * 24 * 7)
};
