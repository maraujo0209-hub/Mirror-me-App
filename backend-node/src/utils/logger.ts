import { createLogger, format, transports } from 'winston';
import { environment } from '../config/environment';

// Custom log level hierarchy configuration mapping
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Map terminal logging colors for clear structural debugging readouts
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
};

// Register formatting rules dynamically to winston framework layout
import winston from 'winston';
winston.addColors(logColors);

/**
 * Centrally Managed Application Logger Instance
 */
export const logger = createLogger({
  levels: logLevels,
  // Automatically fallback to debug logs locally, but cap noise at info tier in production
  level: environment.NODE_ENV === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    format.errors({ stack: true }), // Automatically extracts stack traces from native JavaScript Error objects
    format.splat()
  ),
  transports: [
    // 1. Production Target Stream: Standard Console Output (STDOUT/STDERR)
    new transports.Console({
      format: environment.NODE_ENV === 'production'
        ? format.combine(
            format.json() // Clean, machine-readable JSON payloads for cloud logging aggregators
          )
        : format.combine(
            format.colorize({ all: true }),
            format.printf(
              (info) => `[${info.timestamp}] [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
            )
          ),
    }),
  ],
});

// Create a lightweight stream adapter block allowing standard HTTP frameworks (like morgan) to route traffic through our logger
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
