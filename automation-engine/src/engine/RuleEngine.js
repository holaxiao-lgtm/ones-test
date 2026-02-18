class RuleEngine {
  constructor(rules, actionExecutor) {
    this.rules = rules;
    this.actionExecutor = actionExecutor;
  }

  async run(context) {
    logger.info("[engine] running scan");

    const issues = await context.issueService.listAllIssues(context.config.projectId);
    logger.info(`[engine] fetched issues: ${issues.length}`);

    const triggerCounts = {};
    for (const rule of this.rules) {
      triggerCounts[rule.name] = 0;
    }

    for (const issue of issues) {
      for (const rule of this.rules) {
        try {
          const matched = await rule.condition({ ...context, issue });
          if (matched) {
            triggerCounts[rule.name] += 1;
            await this.actionExecutor.execute(rule, { ...context, issue });
          }
        } catch (err) {
          logger.error(`[engine] rule error: ${rule.name}`, err);
        }
      }
    }

    for (const rule of this.rules) {
      logger.info(`[engine] rule triggered: ${rule.name} = ${triggerCounts[rule.name]}`);
    }
  }
}

module.exports = RuleEngine;
const logger = require("../logger");
