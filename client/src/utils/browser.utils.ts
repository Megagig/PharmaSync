/**
 * Utility functions for handling browser-specific issues
 */

/**
 * Safely execute a function that might interact with browser extensions
 * This helps prevent "Unchecked runtime.lastError: The message port closed before a response was received" errors
 * 
 * @param callback Function to execute safely
 * @param fallbackValue Value to return if an error occurs (optional)
 * @returns The result of the callback or the fallback value if an error occurs
 */
export const safelyExecute = <T>(callback: () => T, fallbackValue?: T): T => {
  try {
    return callback();
  } catch (error) {
    // Handle browser extension communication errors
    if (error instanceof Error && 
        (error.message.includes('message port closed') || 
         error.message.includes('runtime.lastError'))) {
      console.warn('Browser extension communication error handled gracefully:', error.message);
      return fallbackValue as T;
    }
    // Re-throw other errors
    throw error;
  }
};

/**
 * Wrap event handlers to prevent browser extension errors
 * 
 * @param handler The event handler function to wrap
 * @returns A wrapped event handler that catches browser extension errors
 */
export const safeEventHandler = <E extends Event>(handler: (event: E) => void) => {
  return (event: E) => {
    safelyExecute(() => handler(event));
  };
};

/**
 * Check if the current browser has known extension issues
 * 
 * @returns Boolean indicating if the browser might have extension issues
 */
export const hasPotentialExtensionIssues = (): boolean => {
  // Check for Chrome/Edge with extensions
  const isChromium = navigator.userAgent.includes('Chrome') || 
                     navigator.userAgent.includes('Edg');
  
  // Check for extension-related objects
  const hasExtensionAPIs = typeof chrome !== 'undefined' && 
                          chrome.runtime && 
                          chrome.runtime.id;
  
  return isChromium && hasExtensionAPIs;
};
