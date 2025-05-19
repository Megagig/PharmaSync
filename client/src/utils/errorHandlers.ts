/**
 * Utility functions for handling common errors in the application
 */

/**
 * Handles the "message port closed" error that occurs with browser extensions
 * This is a global error handler that can be attached to the window object
 */
export const setupGlobalErrorHandlers = (): void => {
  // Store the original console.error function
  const originalConsoleError = console.error;

  // Override console.error to filter out known browser extension errors
  console.error = (...args: any[]) => {
    // Check if this is a message port error
    const errorString = args.join(' ');
    if (
      errorString.includes('message port closed') ||
      errorString.includes('runtime.lastError') ||
      errorString.includes('Unchecked runtime.lastError')
    ) {
      // Just log a warning instead of an error
      console.warn('Browser extension error suppressed:', errorString);
      return;
    }

    // Otherwise, pass through to the original console.error
    originalConsoleError.apply(console, args);
  };

  // Add a global error handler for uncaught errors
  window.addEventListener('error', (event) => {
    if (
      event.error &&
      event.error.message &&
      (event.error.message.includes('message port closed') ||
        event.error.message.includes('runtime.lastError'))
    ) {
      // Prevent the error from propagating
      event.preventDefault();
      console.warn('Suppressed browser extension error:', event.error.message);
      return false;
    }
    return true;
  });

  // Add a global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      typeof event.reason.message === 'string' &&
      (event.reason.message.includes('message port closed') ||
        event.reason.message.includes('runtime.lastError'))
    ) {
      // Prevent the rejection from propagating
      event.preventDefault();
      console.warn('Suppressed browser extension promise rejection:', event.reason.message);
      return false;
    }
    return true;
  });
};
