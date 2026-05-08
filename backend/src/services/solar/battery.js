class Battery {
  #voltage;
  #ampHours;
  #healthPercent;
  #depthOfDischargePercent;
  #inverterEfficiencyPercent;

  constructor({
    voltage,
    ampHours,
    healthPercent,
    depthOfDischargePercent,
    inverterEfficiencyPercent
  }) {
    this.#voltage = Number(voltage);
    this.#ampHours = Number(ampHours);
    this.#healthPercent = Number(healthPercent);
    this.#depthOfDischargePercent = Number(depthOfDischargePercent);
    this.#inverterEfficiencyPercent = Number(inverterEfficiencyPercent);
  }

  get nominalWattHours() {
    return this.#voltage * this.#ampHours;
  }

  get usableWattHours() {
    const health = this.#healthPercent / 100;
    const depth = this.#depthOfDischargePercent / 100;
    const inverter = this.#inverterEfficiencyPercent / 100;
    return this.nominalWattHours * health * depth * inverter;
  }
}

module.exports = Battery;
