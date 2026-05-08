const { requireUser } = require("../middleware/auth");
const solarService = require("../services/solarService");

async function list(ctx) {
  const user = requireUser(ctx);
  return {
    status: 200,
    body: {
      estimates: solarService.listEstimates(user)
    }
  };
}

async function calculate(ctx) {
  const user = requireUser(ctx);
  return {
    status: 201,
    body: {
      estimate: solarService.calculateAndStore(user, ctx.body)
    }
  };
}

module.exports = {
  calculate,
  list
};
