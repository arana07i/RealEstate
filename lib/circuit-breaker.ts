interface CircuitState {
  failures: number;
  lastFailure: number;
  openUntil?: number;
}

const circuitBreakers = new Map<string, CircuitState>();
const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT = 60000; // 1 minute

export function withCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  fallback?: () => T
): Promise<T> {
  const state = circuitBreakers.get(serviceName) || { failures: 0, lastFailure: 0 };

  // Check if circuit is open
  if (state.openUntil && Date.now() < state.openUntil) {
    if (fallback) return Promise.resolve(fallback());
    throw new Error(`${serviceName} circuit breaker is open`);
  }

  return fn()
    .then((result) => {
      circuitBreakers.set(serviceName, { failures: 0, lastFailure: 0 });
      return result;
    })
    .catch((error) => {
      const newFailures = state.failures + 1;
      if (newFailures >= FAILURE_THRESHOLD) {
        circuitBreakers.set(serviceName, {
          failures: newFailures,
          lastFailure: Date.now(),
          openUntil: Date.now() + RECOVERY_TIMEOUT,
        });
      } else {
        circuitBreakers.set(serviceName, {
          failures: newFailures,
          lastFailure: Date.now(),
        });
      }
      if (fallback) return fallback();
      throw error;
    });
}

export function resetCircuitBreaker(serviceName: string) {
  circuitBreakers.delete(serviceName);
}