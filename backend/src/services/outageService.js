const database = require("./database");
const { AppError, assertOrThrow } = require("../utils/errors");
const { cleanString, clampNumber } = require("../utils/validation");

const allowedStatuses = new Set(["pending", "verified", "resolved", "dismissed"]);
const allowedTypes = new Set(["loadshedding", "maintenance", "power_on"]);
const allowedSeverities = new Set(["low", "medium", "high", "critical"]);

function toPublicOutage(report, users) {
  const user = users.find((item) => item.id === report.userId);
  return {
    ...report,
    reporterName: user ? user.name : "Community member"
  };
}

function listOutages(query = {}) {
  const data = database.readDatabase();
  let reports = data.outages.map((report) => toPublicOutage(report, data.users));

  const district = cleanString(query.district || "", 60).toLowerCase();
  const status = cleanString(query.status || "", 30);
  const type = cleanString(query.type || "", 30);

  if (district) {
    reports = reports.filter((report) => report.district.toLowerCase().includes(district));
  }
  if (allowedStatuses.has(status)) {
    reports = reports.filter((report) => report.status === status);
  }
  if (allowedTypes.has(type)) {
    reports = reports.filter((report) => report.outageType === type);
  }

  return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function createOutage(user, body) {
  const district = cleanString(body.district, 60);
  const area = cleanString(body.area, 90);
  const outageType = cleanString(body.outageType || "loadshedding", 30);
  const severity = cleanString(body.severity || "medium", 30);
  const note = cleanString(body.note, 400);
  const startedAt = body.startedAt ? new Date(body.startedAt) : new Date();
  const durationHours = clampNumber(body.durationHours, 0, 48, 1);

  assertOrThrow(district.length >= 2, 400, "District is required.");
  assertOrThrow(area.length >= 2, 400, "Area is required.");
  assertOrThrow(allowedTypes.has(outageType), 400, "Unsupported report type.");
  assertOrThrow(allowedSeverities.has(severity), 400, "Unsupported severity.");
  assertOrThrow(!Number.isNaN(startedAt.getTime()), 400, "Start time is invalid.");

  return database.transaction((data) => {
    const report = {
      id: database.nextId(data, "outages", "out"),
      userId: user.id,
      district,
      area,
      outageType,
      startedAt: startedAt.toISOString(),
      durationHours,
      severity,
      note,
      status: user.role === "admin" ? "verified" : "pending",
      createdAt: new Date().toISOString()
    };

    data.outages.push(report);
    return toPublicOutage(report, data.users);
  });
}

function deleteOutage(user, id) {
  return database.transaction((data) => {
    const index = data.outages.findIndex((report) => report.id === id);
    assertOrThrow(index >= 0, 404, "Report was not found.");

    const report = data.outages[index];
    if (user.role !== "admin" && report.userId !== user.id) {
      throw new AppError(403, "You can delete only your own report.");
    }

    data.outages.splice(index, 1);
    return { deleted: true };
  });
}

function updateStatus(user, id, status) {
  assertOrThrow(user.role === "admin", 403, "Admin access is required.");
  assertOrThrow(allowedStatuses.has(status), 400, "Unsupported status.");

  return database.transaction((data) => {
    const report = data.outages.find((item) => item.id === id);
    assertOrThrow(report, 404, "Report was not found.");

    report.status = status;
    report.reviewedAt = new Date().toISOString();
    report.reviewedBy = user.id;

    return toPublicOutage(report, data.users);
  });
}

function getMetrics(user = null) {
  const data = database.readDatabase();
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const publicReports = data.outages.map((report) => toPublicOutage(report, data.users));
  const reportsLast24h = publicReports.filter(
    (report) => new Date(report.createdAt).getTime() >= oneDayAgo
  );
  const activeReports = publicReports.filter(
    (report) => report.outageType !== "power_on" && report.status !== "resolved"
  );
  const districts = new Map();

  activeReports.forEach((report) => {
    districts.set(report.district, (districts.get(report.district) || 0) + 1);
  });

  const topDistricts = [...districts.entries()]
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const payload = {
    totals: {
      reports: data.outages.length,
      reportsLast24h: reportsLast24h.length,
      activeAreas: districts.size,
      verifiedReports: publicReports.filter((report) => report.status === "verified").length
    },
    topDistricts,
    recentReports: publicReports
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
  };

  if (user) {
    payload.user = {
      reports: data.outages.filter((report) => report.userId === user.id).length,
      solarEstimates: data.solarEstimates.filter((estimate) => estimate.userId === user.id).length,
      latestSolarEstimate:
        data.solarEstimates
          .filter((estimate) => estimate.userId === user.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
    };
  }

  return payload;
}

module.exports = {
  createOutage,
  deleteOutage,
  getMetrics,
  listOutages,
  updateStatus
};
