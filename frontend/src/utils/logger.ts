export const logInfo = (component: string, message: string): void => {
  console.log(`[INFO] [${component}] ${message}`);
};

export const logError = (component: string, message: string, error?: unknown): void => {
  console.error(`[ERROR] [${component}] ${message}`, error || '');
};

export const logWarn = (component: string, message: string): void => {
  console.warn(`[WARN] [${component}] ${message}`);
};

export const logSuccess = (component: string, message: string): void => {
  console.log(`[SUCCESS] [${component}] ${message}`);
};
