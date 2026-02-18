const logger = require("./logger");
let cron = null;

try {
  cron = require("node-cron");
} catch (err) {
  logger.warn("[scheduler] node-cron not available, fallback to setInterval");
}

class Scheduler {
  constructor(cronExpression, taskFn) {
    this.cronExpression = cronExpression;
    this.taskFn = taskFn;
    this.job = null;
  }

  start() {
    logger.info(`[scheduler] scheduling with cron: ${this.cronExpression}`);
    if (cron) {
      this.job = cron.schedule(this.cronExpression, async () => {
        logger.info("[scheduler] scan tick");
        try {
          await this.taskFn();
        } catch (err) {
          logger.error("[scheduler] scan error", err);
        }
      });

      this.job.start();
      logger.info("[scheduler] started");
      return;
    }

    const intervalMs = 5 * 60 * 1000;
    this.job = setInterval(async () => {
      logger.info("[scheduler] scan tick (interval fallback)");
      try {
        await this.taskFn();
      } catch (err) {
        logger.error("[scheduler] scan error", err);
      }
    }, intervalMs);
    logger.info("[scheduler] started (interval fallback)");
  }

  stop() {
    if (this.job) {
      if (typeof this.job.stop === "function") {
        this.job.stop();
      } else {
        clearInterval(this.job);
      }
      logger.info("[scheduler] stopped");
    }
  }
}

module.exports = Scheduler;
