const assert = require("assert");
const PowerCalculator = require("../src/services/solar/calculator");

const estimate = new PowerCalculator({
  batteryVoltage: 12,
  batteryAh: 100,
  batteryHealthPercent: 90,
  depthOfDischargePercent: 70,
  inverterEfficiencyPercent: 85,
  panelWatts: 150,
  sunlightHours: 5,
  fanCount: 2,
  lightCount: 3,
  routerCount: 1,
  laptopCount: 1,
  phoneCount: 2,
  customLoadWatts: 0
}).calculate();

assert.equal(estimate.totalLoadWatts, 291);
assert.equal(estimate.usableWattHours, 642.6);
assert.equal(estimate.status, "critical");
assert.ok(estimate.estimatedBackupHours > 2);
assert.ok(estimate.advice.length >= 2);

console.log("Solar OOP calculation test passed.");
