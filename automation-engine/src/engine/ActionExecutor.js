const logger = require("../logger");

class ActionExecutor {
  async execute(rule, context) {
    logger.info(`[action] executing rule: ${rule.name} on issue ${context.issue.id || context.issue.uuid || "unknown"}`);
    await rule.action(context);
  }
}

module.exports = ActionExecutor;
