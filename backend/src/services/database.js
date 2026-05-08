const fs = require("fs");
const path = require("path");
const env = require("../config/env");
const { hashPassword } = require("../utils/security");

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function createSeedData() {
  const adminId = "u_1";
  const demoId = "u_2";

  return {
    counters: {
      users: 2,
      outages: 5,
      solarEstimates: 2
    },
    users: [
      {
        id: adminId,
        name: "Ebnul Hasan Mahi",
        email: "mahi242-35-001@diu.edu.bd",
        passwordHash: hashPassword("Mahi@12345"),
        role: "admin",
        createdAt: new Date().toISOString()
      },
      {
        id: demoId,
        name: "Demo Student",
        email: "demo@powerpulse.bd",
        passwordHash: hashPassword("Demo@12345"),
        role: "user",
        createdAt: new Date().toISOString()
      }
    ],
    outages: [
      {
        id: "out_1",
        userId: adminId,
        district: "Sylhet",
        area: "Tahirpur",
        outageType: "loadshedding",
        startedAt: hoursAgo(2.5),
        durationHours: 3,
        severity: "high",
        note: "Evening power cut affecting study hours and small shops.",
        status: "verified",
        createdAt: hoursAgo(2.4)
      },
      {
        id: "out_2",
        userId: adminId,
        district: "Gazipur",
        area: "Kapasia",
        outageType: "loadshedding",
        startedAt: hoursAgo(7),
        durationHours: 4,
        severity: "critical",
        note: "Factories and shops reported extended backup generator use.",
        status: "pending",
        createdAt: hoursAgo(6.8)
      },
      {
        id: "out_3",
        userId: adminId,
        district: "Noakhali",
        area: "Chatkhil",
        outageType: "loadshedding",
        startedAt: hoursAgo(12),
        durationHours: 5,
        severity: "critical",
        note: "Repeated short intervals of supply.",
        status: "verified",
        createdAt: hoursAgo(11.7)
      },
      {
        id: "out_4",
        userId: adminId,
        district: "Dhaka",
        area: "Dhanmondi",
        outageType: "maintenance",
        startedAt: hoursAgo(20),
        durationHours: 1,
        severity: "medium",
        note: "Short planned maintenance window.",
        status: "resolved",
        createdAt: hoursAgo(19.8)
      },
      {
        id: "out_5",
        userId: adminId,
        district: "Chattogram",
        area: "Pahartali",
        outageType: "power_on",
        startedAt: hoursAgo(1),
        durationHours: 0,
        severity: "low",
        note: "Power restored after local interruption.",
        status: "verified",
        createdAt: hoursAgo(1)
      }
    ],
    solarEstimates: [
      {
        id: "sol_1",
        userId: adminId,
        createdAt: hoursAgo(5),
        inputs: {
          batteryVoltage: 12,
          batteryAh: 120,
          batteryHealthPercent: 86,
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
        },
        result: {
          totalLoadWatts: 243,
          usableWattHours: 763,
          estimatedBackupHours: 3.14,
          estimatedSolarWattHours: 750,
          rechargeCoveragePercent: 98.3,
          status: "caution",
          advice: ["Reduce fan use during long cuts.", "Battery can cover a normal evening load."]
        }
      },
      {
        id: "sol_2",
        userId: adminId,
        createdAt: hoursAgo(22),
        inputs: {
          batteryVoltage: 12,
          batteryAh: 80,
          batteryHealthPercent: 72,
          depthOfDischargePercent: 65,
          inverterEfficiencyPercent: 85,
          panelWatts: 100,
          sunlightHours: 4.5,
          fanCount: 1,
          lightCount: 3,
          routerCount: 1,
          laptopCount: 0,
          phoneCount: 2,
          customLoadWatts: 0
        },
        result: {
          totalLoadWatts: 104,
          usableWattHours: 382,
          estimatedBackupHours: 3.67,
          estimatedSolarWattHours: 338,
          rechargeCoveragePercent: 88.4,
          status: "caution",
          advice: ["Charge phones before evening peak.", "Clean panels weekly during dusty weather."]
        }
      }
    ]
  };
}

function ensureDatabase() {
  const dataDir = path.dirname(env.dataFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(env.dataFile)) {
    writeDatabase(createSeedData());
  }
}

function readDatabase() {
  ensureDatabase();
  return JSON.parse(fs.readFileSync(env.dataFile, "utf8"));
}

function writeDatabase(data) {
  const dataDir = path.dirname(env.dataFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const tmpFile = `${env.dataFile}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
  fs.renameSync(tmpFile, env.dataFile);
}

function nextId(data, counterName, prefix) {
  data.counters[counterName] = Number(data.counters[counterName] || 0) + 1;
  return `${prefix}_${data.counters[counterName]}`;
}

function transaction(mutator) {
  const data = readDatabase();
  const result = mutator(data);
  writeDatabase(data);
  return result;
}

function publicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

module.exports = {
  nextId,
  publicUser,
  readDatabase,
  transaction
};
