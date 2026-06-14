/**
 * Centralized logging utility
 * In development: logs to console
 * In production: can be extended to send to error tracking service
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  error: (message: string, error?: unknown) => {
    if (isDevelopment) {
      console.error(message, error);
    }
    // In production, you could send to error tracking service:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { extra: { message } });
    // }
  },
};

