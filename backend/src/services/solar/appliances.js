class Appliance {
  #name;
  #wattage;
  #quantity;

  constructor(name, wattage, quantity) {
    this.#name = name;
    this.#wattage = Number(wattage);
    this.#quantity = Number(quantity);
  }

  get name() {
    return this.#name;
  }

  get wattage() {
    return this.#wattage;
  }

  get quantity() {
    return this.#quantity;
  }

  calculateConsumption() {
    return this.#wattage * this.#quantity;
  }
}

class Fan extends Appliance {
  constructor(quantity) {
    super("Fan", 75, quantity);
  }

  calculateConsumption() {
    return super.calculateConsumption() * 1.08;
  }
}

class Light extends Appliance {
  constructor(quantity) {
    super("LED light", 12, quantity);
  }
}

class Router extends Appliance {
  constructor(quantity) {
    super("Router", 12, quantity);
  }
}

class Laptop extends Appliance {
  constructor(quantity) {
    super("Laptop", 65, quantity);
  }
}

class PhoneCharger extends Appliance {
  constructor(quantity) {
    super("Phone charger", 8, quantity);
  }
}

class CustomLoad extends Appliance {
  constructor(wattage) {
    super("Custom load", Math.max(0, Number(wattage) || 0), 1);
  }
}

module.exports = {
  Appliance,
  CustomLoad,
  Fan,
  Laptop,
  Light,
  PhoneCharger,
  Router
};
