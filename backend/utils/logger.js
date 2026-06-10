const logger = {
  info: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()}`, ...args);
    }
  },
  error: (...args) => {
    console.error(`[ERROR] ${new Date().toISOString()}`, ...args);
  },
  warn: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] ${new Date().toISOString()}`, ...args);
    }
  },
};

export default logger;
