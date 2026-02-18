const isPluginEnv = Boolean(globalThis && globalThis.onesEnv && globalThis.onesEnv._Logger);
const baseLogger = isPluginEnv ? globalThis.onesEnv._Logger : console;

function safeStringify(value) {
  try {
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  } catch (err) {
    return "[unserializable]";
  }
}

function formatArgs(args) {
  return args.map((arg) => {
    if (arg instanceof Error) {
      return `${arg.message}\n${arg.stack || ""}`;
    }
    if (typeof arg === "object") {
      return safeStringify(arg);
    }
    return String(arg);
  });
}

function log(level, ...args) {
  const parts = formatArgs(args);
  if (baseLogger && typeof baseLogger[level] === "function") {
    baseLogger[level](...parts);
    return;
  }
  if (typeof console[level] === "function") {
    console[level](...parts);
    return;
  }
  console.log(...parts);
}

module.exports = {
  info: (...args) => log("info", ...args),
  warn: (...args) => log("warn", ...args),
  error: (...args) => log("error", ...args),
  debug: (...args) => log("debug", ...args)
};
