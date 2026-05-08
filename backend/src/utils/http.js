const fs = require("fs");
const path = require("path");

const ONE_MB = 1024 * 1024;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function setCommonHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self'; img-src 'self' data:; connect-src 'self'; font-src 'self'"
  );
}

function sendJson(res, statusCode, payload) {
  setCommonHeaders(res);
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, {
    error: {
      message,
      details
    }
  });
}

function readBody(req, limit = ONE_MB) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > limit) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      const contentType = req.headers["content-type"] || "";
      if (!contentType.includes("application/json")) {
        reject(new Error("Only application/json request bodies are supported."));
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });

    req.on("error", reject);
  });
}

function serveStatic(req, res, frontendDir) {
  const requestUrl = new URL(req.url, "http://localhost");
  let requestedPath = decodeURIComponent(requestUrl.pathname);

  if (requestedPath === "/") {
    requestedPath = "/index.html";
  }

  let filePath = path.resolve(frontendDir, `.${requestedPath}`);

  if (!filePath.startsWith(frontendDir)) {
    sendError(res, 403, "Forbidden path.");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(frontendDir, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  setCommonHeaders(res);
  res.writeHead(200, {
    "Content-Type": contentTypes[ext] || "application/octet-stream"
  });
  fs.createReadStream(filePath).pipe(res);
}

module.exports = {
  readBody,
  sendError,
  sendJson,
  serveStatic
};
