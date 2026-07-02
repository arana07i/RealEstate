// Monitoring module - extend with Sentry or other services
// To enable Sentry: npm install @sentry/nextjs

export function reportError(error: Error, context?: Record<string, unknown>) {
  console.error(JSON.stringify({
    level: 'error',
    type: 'uncaught_exception',
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  }));
}

// For client-side error handling
export function setupGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    reportError(event.error || new Error(event.message), {
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError(new Error(String(event.reason)), { type: 'unhandled_promise_rejection' });
  });
}