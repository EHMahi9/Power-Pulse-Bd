const database = require("./database");
const PowerCalculator = require("./solar/calculator");

function calculateAndStore(user, body) {
  const calculator = new PowerCalculator(body);
  const result = calculator.calculate();
  const inputs = calculator.input;

  return database.transaction((data) => {
    const estimate = {
      id: database.nextId(data, "solarEstimates", "sol"),
      userId: user.id,
      createdAt: new Date().toISOString(),
      inputs,
      result
    };

    data.solarEstimates.push(estimate);
    return estimate;
  });
}

function listEstimates(user) {
  const data = database.readDatabase();
  return data.solarEstimates
    .filter((estimate) => estimate.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  calculateAndStore,
  listEstimates
};
