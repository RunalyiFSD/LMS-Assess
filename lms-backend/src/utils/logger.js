/**
 * Application Logger
 *
 * Purpose:
 *   Centralized structured logging with log levels and timestamps.
 *   Provides a foundation for adding robust logging (like Winston/Pino)
 *   in the future without rewriting every log statement.
 *
 * Responsibilities:
 *   - Provide standard log levels (info, warn, error, debug)
 *   - Format log messages consistently
 *   - Prevent debug logs in production
 *
 * Future extension points:
 *   - Connect to external log aggregation (DataDog, CloudWatch)
 *   - Swap internal implementation to a high-performance logger (Pino)
 *
 * Dependencies:
 *   - None (uses native console for now)
 */

const getTimestamp = () => new Date().toISOString();

const formatMessage = (level, message, meta) => {
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${getTimestamp()}] [${level.toUpperCase()}] ${message}${metaStr}`;
};

const logger = {
  info: (message, meta) => {
    console.log(formatMessage('info', message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatMessage('warn', message, meta));
  },
  error: (message, errorOrMeta) => {
    let meta = errorOrMeta;
    if (errorOrMeta instanceof Error) {
      meta = { 
        message: errorOrMeta.message, 
        stack: errorOrMeta.stack, 
        name: errorOrMeta.name 
      };
    }
    console.error(formatMessage('error', message, meta));
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', message, meta));
    }
  },
};

module.exports = logger;
