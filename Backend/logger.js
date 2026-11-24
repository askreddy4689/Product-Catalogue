/**
 * A very small logger. All log output goes through here, so it can later be replaced
 * by a structured logger or a monitoring service in one place.
 * Logging is switched off while the tests run, to keep their output readable.
 */
const isRunningTests = process.env.NODE_ENV === 'test';

function write(level, message, details) {
  if (isRunningTests) return;
  const line = `${new Date().toISOString()} ${level.toUpperCase()} ${message}`;
  const print = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  if (details === undefined) {
    print(line);
  } else {
    print(line, details);
  }
}

module.exports = {
  info: (message, details) => write('info', message, details),
  warn: (message, details) => write('warn', message, details),
  error: (message, details) => write('error', message, details),
};
