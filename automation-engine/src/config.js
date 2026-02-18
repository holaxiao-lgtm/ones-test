const dotenv = require("dotenv");

const isPluginEnv = Boolean(globalThis && globalThis.onesEnv);
if (!isPluginEnv) {
  dotenv.config();
}

const REQUIRED_KEYS = [
  "ONES_BASE_URL",
  "ONES_TOKEN",
  "PROJECT_ID",
  "OVERDUE_DAYS",
  "TARGET_STATUS"
];

const config = {
  onesBaseUrl: process.env.ONES_BASE_URL || "",
  onesToken: process.env.ONES_TOKEN || "",
  projectId: process.env.PROJECT_ID || "",
  overdueDays: parseInt(process.env.OVERDUE_DAYS || "0", 10),
  targetStatus: process.env.TARGET_STATUS || "",
  cronSchedule: process.env.CRON_SCHEDULE || "*/5 * * * *"
};

const missingKeys = REQUIRED_KEYS.filter((key) => !process.env[key]);
const invalidOverdueDays = Number.isNaN(config.overdueDays) || config.overdueDays < 0;

module.exports = {
  ...config,
  missingKeys,
  isValid: missingKeys.length === 0 && !invalidOverdueDays,
  invalidOverdueDays
};
