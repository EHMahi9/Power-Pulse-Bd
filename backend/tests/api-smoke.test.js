const assert = require("assert");
const fs = require("fs");
const path = require("path");

process.env.PORT = process.env.PORT || "4399";
process.env.POWERPULSE_DATA_FILE =
  process.env.POWERPULSE_DATA_FILE || path.join(__dirname, "tmp-powerpulse-smoke.db.json");

const { createServer } = require("../src/server");

const port = Number(process.env.PORT);
const baseUrl = `http://localhost:${port}`;
const server = createServer();

function listen() {
  return new Promise((resolve) => server.listen(port, resolve));
}

function close() {
  return new Promise((resolve) => server.close(resolve));
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

(async () => {
  await listen();
  try {
    const email = `student.${Date.now()}@powerpulse.test`;
    const session = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Smoke Student",
        email,
        password: "Smoke12345"
      }
    });

    assert.ok(session.token);
    assert.equal(session.user.email, email);

    const reportPayload = await request("/api/outages", {
      method: "POST",
      token: session.token,
      body: {
        district: "Gazipur",
        area: "Board Bazar",
        outageType: "loadshedding",
        startedAt: new Date().toISOString(),
        durationHours: 2,
        severity: "high",
        note: "Smoke test report"
      }
    });

    assert.equal(reportPayload.report.status, "pending");

    const estimatePayload = await request("/api/solar/calculate", {
      method: "POST",
      token: session.token,
      body: {
        batteryVoltage: 12,
        batteryAh: 120,
        batteryHealthPercent: 85,
        depthOfDischargePercent: 70,
        inverterEfficiencyPercent: 88,
        panelWatts: 200,
        sunlightHours: 5,
        fanCount: 2,
        lightCount: 4,
        routerCount: 1,
        laptopCount: 1,
        phoneCount: 2,
        customLoadWatts: 0
      }
    });

    assert.ok(estimatePayload.estimate.result.estimatedBackupHours > 0);

    const metrics = await request("/api/metrics", {
      token: session.token
    });

    assert.ok(metrics.totals.reports >= 1);
    assert.ok(metrics.user.reports >= 1);
    console.log("API smoke test passed.");
  } finally {
    await close();
    fs.rmSync(process.env.POWERPULSE_DATA_FILE, { force: true });
  }
})().catch(async (error) => {
  console.error(error);
  await close();
  fs.rmSync(process.env.POWERPULSE_DATA_FILE, { force: true });
  process.exit(1);
});
