const { requireUser } = require("../middleware/auth");
const outageService = require("../services/outageService");

async function list(ctx) {
  return {
    status: 200,
    body: {
      reports: outageService.listOutages(ctx.query)
    }
  };
}

async function create(ctx) {
  const user = requireUser(ctx);
  return {
    status: 201,
    body: {
      report: outageService.createOutage(user, ctx.body)
    }
  };
}

async function remove(ctx) {
  const user = requireUser(ctx);
  return {
    status: 200,
    body: outageService.deleteOutage(user, ctx.params.id)
  };
}

async function updateStatus(ctx) {
  const user = requireUser(ctx);
  return {
    status: 200,
    body: {
      report: outageService.updateStatus(user, ctx.params.id, ctx.body.status)
    }
  };
}

module.exports = {
  create,
  list,
  remove,
  updateStatus
};
