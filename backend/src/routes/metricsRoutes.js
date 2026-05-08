const outageService = require("../services/outageService");

async function summary(ctx) {
  return {
    status: 200,
    body: outageService.getMetrics(ctx.user)
  };
}

module.exports = {
  summary
};
