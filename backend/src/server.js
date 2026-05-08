const http = require("http");
const env = require("./config/env");
const { AppError } = require("./utils/errors");
const { readBody, sendError, sendJson, serveStatic } = require("./utils/http");
const authMiddleware = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const outageRoutes = require("./routes/outageRoutes");
const solarRoutes = require("./routes/solarRoutes");

const routes = [
  route("POST", /^\/api\/auth\/register$/, authRoutes.register, true),
  route("POST", /^\/api\/auth\/login$/, authRoutes.login, true),
  route("GET", /^\/api\/auth\/me$/, authRoutes.me),
  route("GET", /^\/api\/metrics$/, metricsRoutes.summary),
  route("GET", /^\/api\/outages$/, outageRoutes.list),
  route("POST", /^\/api\/outages$/, outageRoutes.create, true),
  route("DELETE", /^\/api\/outages\/(?<id>[^/]+)$/, outageRoutes.remove),
  route("PATCH", /^\/api\/outages\/(?<id>[^/]+)\/status$/, outageRoutes.updateStatus, true),
  route("GET", /^\/api\/solar\/estimates$/, solarRoutes.list),
  route("POST", /^\/api\/solar\/calculate$/, solarRoutes.calculate, true)
];

const apiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 90
});

function route(method, pattern, handler, readsBody = false) {
  return {
    method,
    pattern,
    handler,
    readsBody
  };
}

function createServer() {
  return http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, "http://localhost");

    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }

    if (requestUrl.pathname.startsWith("/api/")) {
      await handleApi(req, res, requestUrl);
      return;
    }

    serveStatic(req, res, env.frontendDir);
  });
}

async function handleApi(req, res, requestUrl) {
  try {
    apiLimiter(req);

    const match = routes
      .filter((candidate) => candidate.method === req.method)
      .map((candidate) => ({
        route: candidate,
        match: requestUrl.pathname.match(candidate.pattern)
      }))
      .find((candidate) => candidate.match);

    if (!match) {
      sendError(res, 404, "API route was not found.");
      return;
    }

    const body = match.route.readsBody ? await readBody(req) : {};
    const user = authMiddleware.optionalUser(req);
    const ctx = {
      body,
      params: match.match.groups || {},
      query: Object.fromEntries(requestUrl.searchParams.entries()),
      req,
      user
    };
    const result = await match.route.handler(ctx);
    sendJson(res, result.status || 200, result.body || {});
  } catch (error) {
    if (error instanceof AppError) {
      sendError(res, error.statusCode, error.message, error.details);
      return;
    }

    if (error.message && error.message.includes("JSON")) {
      sendError(res, 400, error.message);
      return;
    }

    console.error(error);
    sendError(res, 500, "Unexpected server error.");
  }
}

function createLimiter({ windowMs, max }) {
  const buckets = new Map();

  return function limit(req) {
    const ip = req.socket.remoteAddress || "local";
    const now = Date.now();
    const bucket = buckets.get(ip) || { count: 0, resetAt: now + windowMs };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(ip, bucket);

    if (bucket.count > max) {
      throw new AppError(429, "Too many requests. Try again shortly.");
    }
  };
}

if (require.main === module) {
  const server = createServer();
  server.listen(env.port, () => {
    console.log(`PowerPulse BD running at http://localhost:${env.port}`);
  });
}

module.exports = {
  createServer
};
