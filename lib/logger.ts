type LogLevel = "debug" | "info" | "warn" | "error";

function formatMessage(
  level: LogLevel,
  scope: string,
  message: string,
  meta?: object,
): string {
  const timestamp = new Date().toISOString();
  const metaString =
    meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] [${scope}] ${message}${metaString}`;
}

function write(level: LogLevel, scope: string, message: string, meta?: object) {
  const output = formatMessage(level, scope, message, meta);

  switch (level) {
    case "debug":
    case "info":
      console.log(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "error":
      console.error(output);
      break;
  }
}

export const logger = {
  debug(scope: string, message: string, meta?: object) {
    if (process.env.NODE_ENV !== "production") {
      write("debug", scope, message, meta);
    }
  },
  info(scope: string, message: string, meta?: object) {
    write("info", scope, message, meta);
  },
  warn(scope: string, message: string, meta?: object) {
    write("warn", scope, message, meta);
  },
  error(scope: string, message: string, meta?: object) {
    write("error", scope, message, meta);
  },
};
