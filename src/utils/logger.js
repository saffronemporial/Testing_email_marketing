// src/utils/logger.js
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  log(...args) {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  error(...args) {
    // Always show errors, even in production
    console.error(...args);
  }

  warn(...args) {
    if (this.isDevelopment) {
      console.warn(...args);
    }
  }

  info(...args) {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }

  debug(...args) {
    if (this.isDevelopment) {
      console.debug(...args);
    }
  }
}

// Create a singleton instance
const logger = new Logger();
export default logger;