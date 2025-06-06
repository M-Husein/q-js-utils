const abortException = (): DOMException => new DOMException("Aborted", "AbortError");

interface AsyncSimulationOptions {
  delay?: number;
  isFail?: boolean;
  signal?: AbortSignal;
}

/**
 * Simulates an asynchronous operation with configurable delay and failure mode
 * @param delay Delay in milliseconds (default: 1000ms)
 * @param isFail Whether to simulate failure (default: false)
 * @param signal AbortSignal for cancellation
 * @returns Promise that resolves with 1 or rejects with 0/AbortError
 */
export const asyncSimulation = ({
  delay = 1e3,
  isFail, // Explicit default: isFail = false
  signal
}: AsyncSimulationOptions = {}): Promise<1 | 0> => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted){
      return reject(abortException());
    }

    const timeout = setTimeout(() => {
      isFail ? reject(0) : resolve(1); // Settle normally
    }, delay);

    // Safely add self-cleaning abort listener
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout); // Cancel pending timeout
      reject(abortException()); // Reject with AbortError
    }, { once: true }); // Critical for safety!
  });
}
