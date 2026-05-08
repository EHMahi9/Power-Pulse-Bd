const Battery = require("./battery");
const { CustomLoad, Fan, Laptop, Light, PhoneCharger, Router } = require("./appliances");
const { clampNumber } = require("../../utils/validation");

class PowerCalculator {
  constructor(input) {
    this.input = {
      batteryVoltage: clampNumber(input.batteryVoltage, 6, 96, 12),
      batteryAh: clampNumber(input.batteryAh, 10, 500, 100),
      batteryHealthPercent: clampNumber(input.batteryHealthPercent, 20, 100, 85),
      depthOfDischargePercent: clampNumber(input.depthOfDischargePercent, 30, 90, 70),
      inverterEfficiencyPercent: clampNumber(input.inverterEfficiencyPercent, 50, 98, 85),
      panelWatts: clampNumber(input.panelWatts, 0, 10000, 0),
      sunlightHours: clampNumber(input.sunlightHours, 0, 12, 0),
      fanCount: clampNumber(input.fanCount, 0, 20, 0),
      lightCount: clampNumber(input.lightCount, 0, 50, 0),
      routerCount: clampNumber(input.routerCount, 0, 10, 0),
      laptopCount: clampNumber(input.laptopCount, 0, 10, 0),
      phoneCount: clampNumber(input.phoneCount, 0, 20, 0),
      customLoadWatts: clampNumber(input.customLoadWatts, 0, 5000, 0)
    };
  }

  buildAppliances() {
    return [
      new Fan(this.input.fanCount),
      new Light(this.input.lightCount),
      new Router(this.input.routerCount),
      new Laptop(this.input.laptopCount),
      new PhoneCharger(this.input.phoneCount),
      new CustomLoad(this.input.customLoadWatts)
    ];
  }

  calculate() {
    const battery = new Battery({
      voltage: this.input.batteryVoltage,
      ampHours: this.input.batteryAh,
      healthPercent: this.input.batteryHealthPercent,
      depthOfDischargePercent: this.input.depthOfDischargePercent,
      inverterEfficiencyPercent: this.input.inverterEfficiencyPercent
    });
    const appliances = this.buildAppliances();
    const loadItems = appliances
      .map((appliance) => ({
        name: appliance.name,
        watts: round(appliance.calculateConsumption(), 1),
        quantity: appliance.quantity
      }))
      .filter((item) => item.watts > 0);
    const totalLoadWatts = loadItems.reduce((sum, item) => sum + item.watts, 0);
    const usableWattHours = battery.usableWattHours;
    const estimatedBackupHours = totalLoadWatts > 0 ? usableWattHours / totalLoadWatts : 0;
    const estimatedSolarWattHours = this.input.panelWatts * this.input.sunlightHours * 0.75;
    const rechargeCoveragePercent =
      usableWattHours > 0 ? (estimatedSolarWattHours / usableWattHours) * 100 : 0;

    return {
      totalLoadWatts: round(totalLoadWatts, 1),
      usableWattHours: round(usableWattHours, 1),
      estimatedBackupHours: round(estimatedBackupHours, 2),
      estimatedSolarWattHours: round(estimatedSolarWattHours, 1),
      rechargeCoveragePercent: round(rechargeCoveragePercent, 1),
      status: classifyBackup(estimatedBackupHours, totalLoadWatts),
      loadItems,
      advice: buildAdvice(estimatedBackupHours, totalLoadWatts, rechargeCoveragePercent)
    };
  }
}

function classifyBackup(hours, totalLoadWatts) {
  if (totalLoadWatts <= 0) {
    return "no_load";
  }
  if (hours >= 6) {
    return "ready";
  }
  if (hours >= 3) {
    return "caution";
  }
  return "critical";
}

function buildAdvice(hours, loadWatts, rechargeCoveragePercent) {
  const advice = [];

  if (loadWatts <= 0) {
    advice.push("Add appliances to calculate a realistic backup plan.");
    return advice;
  }

  if (hours < 3) {
    advice.push("Reduce fan or laptop load during long cuts.");
  } else if (hours < 6) {
    advice.push("Battery can cover a normal evening load with careful use.");
  } else {
    advice.push("Backup duration is strong for routine outages.");
  }

  if (rechargeCoveragePercent < 60) {
    advice.push("Solar recharge may not refill the battery in one sunny day.");
  } else if (rechargeCoveragePercent >= 100) {
    advice.push("Solar recharge can likely refill the usable battery window.");
  } else {
    advice.push("Solar recharge covers most of the usable battery window.");
  }

  advice.push("Clean panels weekly and avoid deep discharge when possible.");
  return advice;
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

module.exports = PowerCalculator;
