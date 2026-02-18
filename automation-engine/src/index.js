const Scheduler = require("./scheduler");
const RuleEngine = require("./engine/RuleEngine");
const ActionExecutor = require("./engine/ActionExecutor");
const overdueReminderRule = require("./rules/overdueReminderRule");
const config = require("./config");
const issueService = require("./services/issueService");
const memoryStore = require("./store/memoryStore");
const logger = require("./logger");

const isPluginEnv = Boolean(globalThis && globalThis.onesEnv);

function buildContext() {
  return {
    config,
    issueService,
    store: memoryStore
  };
}

function validateConfig() {
  if (!config.isValid) {
    const missing = config.missingKeys.length ? config.missingKeys.join(", ") : "none";
    logger.warn(`[engine] config invalid. missing: ${missing}`);
    if (config.invalidOverdueDays) {
      logger.warn("[engine] OVERDUE_DAYS must be a non-negative integer");
    }
    return false;
  }
  return true;
}

const rules = [overdueReminderRule];
const executor = new ActionExecutor();
const engine = new RuleEngine(rules, executor);
let scheduler = null;

function startEngine() {
  logger.info("[engine] starting ONES automation rule engine");
  logger.info(`[engine] loaded rules: ${rules.map((r) => r.name).join(", ")}`);

  if (!validateConfig()) return;
  if (scheduler) return;

  scheduler = new Scheduler(config.cronSchedule, async () => {
    const context = buildContext();
    await engine.run(context);
  });

  scheduler.start();
}

function stopEngine() {
  if (scheduler) {
    scheduler.stop();
    scheduler = null;
  }
}

async function Install() {
  logger.info("[Plugin] Install");
}

async function Enable() {
  logger.info("[Plugin] Enable");
  if (isPluginEnv) startEngine();
}

function Disable() {
  logger.info("[Plugin] Disable");
  stopEngine();
}

function UnInstall() {
  logger.info("[Plugin] UnInstall");
  stopEngine();
}

function Upgrade(oldPluginInfo) {
  const oldVersion = oldPluginInfo && oldPluginInfo.version ? oldPluginInfo.version : "unknown";
  logger.info("[Plugin] Upgrade", "old version:", oldVersion);
}

async function OrgInstall() {
  logger.info("[Plugin] OrgInstall");
}

function OrgEnable() {
  logger.info("[Plugin] OrgEnable");
  if (isPluginEnv) startEngine();
  return [];
}

function OrgDisable() {
  logger.info("[Plugin] OrgDisable");
  stopEngine();
  return [];
}

function OrgUnInstall() {
  logger.info("[Plugin] OrgUnInstall");
  stopEngine();
}

function OrgUpgrade(oldPluginInfo) {
  const oldVersion = oldPluginInfo && oldPluginInfo.version ? oldPluginInfo.version : "unknown";
  logger.info("[Plugin] OrgUpgrade", "old version:", oldVersion);
}

function OnEvent() {
  // Placeholder for event-driven triggers if enabled in plugin.yaml
}

module.exports = {
  Install,
  Enable,
  Disable,
  UnInstall,
  Upgrade,
  OrgInstall,
  OrgEnable,
  OrgDisable,
  OrgUnInstall,
  OrgUpgrade,
  OnEvent
};

if (!isPluginEnv && process.env.RUN_STANDALONE === "1") {
  startEngine();
}

process.on("uncaughtException", (err) => {
  logger.error("[process] uncaughtException", err);
});

process.on("unhandledRejection", (reason) => {
  logger.error("[process] unhandledRejection", reason);
});
