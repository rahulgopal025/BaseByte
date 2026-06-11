const logger = {
  info: (message, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
  success: (message, ...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[SUCCESS] [${new Date().toISOString()}] ${message}`, ...args);
    }
  }
};

export default logger;
