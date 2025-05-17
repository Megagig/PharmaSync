import defaultLogger from './logger';
import { logger as namedLogger } from './logger.utils';

/**
 * Unified logger that works with both logger implementations
 */
const unifiedLogger = {
  info: (message: string, ...args: any[]) => {
    try {
      defaultLogger.info(message, ...args);
    } catch (error) {
      try {
        namedLogger.info(message, ...args);
      } catch (innerError) {
        console.info(message, ...args);
      }
    }
  },
  
  error: (message: string, ...args: any[]) => {
    try {
      defaultLogger.error(message, ...args);
    } catch (error) {
      try {
        namedLogger.error(message, ...args);
      } catch (innerError) {
        console.error(message, ...args);
      }
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    try {
      defaultLogger.warn(message, ...args);
    } catch (error) {
      try {
        namedLogger.warn(message, ...args);
      } catch (innerError) {
        console.warn(message, ...args);
      }
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    try {
      defaultLogger.debug(message, ...args);
    } catch (error) {
      try {
        namedLogger.debug(message, ...args);
      } catch (innerError) {
        console.debug(message, ...args);
      }
    }
  },
};

export { unifiedLogger as logger };
export default unifiedLogger;
