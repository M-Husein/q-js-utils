/**
 * Configuration options for {@link retryAsync}.
 */
type RetryOptions = {
  /**
   * Maximum number of retry attempts.
   *
   * - `0` means no retries (only the initial attempt).
   * - Default: `2`
   */
  max?: number;

  /**
   * Base delay in milliseconds before the first retry.
   *
   * Subsequent retries use exponential backoff:
   * `delay * 2^(attempt - 1)`
   *
   * Default: `300`
   */
  delay?: number;

  /**
   * Maximum delay in milliseconds between retries.
   *
   * Prevents exponential backoff from growing indefinitely.
   *
   * Default: `5000`
   */
  maxDelay?: number;

  /**
   * Adds random jitter to retry delays to avoid synchronized retries.
   *
   * When enabled, the final delay is multiplied by a random factor
   * between `0.5` and `1.5`.
   *
   * Default: `true`
   */
  jitter?: boolean;

  /**
   * Per-attempt timeout in milliseconds.
   *
   * If the timeout is reached, the current attempt is aborted
   * via {@link AbortController}. This does NOT cancel underlying
   * operations that do not support `AbortSignal` (e.g. IndexedDB).
   *
   * Default: `undefined` (no timeout)
   */
  timeout?: number;

  /**
   * Predicate function that determines whether a failed attempt
   * should be retried.
   *
   * Returning `false` immediately stops retries and rethrows the error.
   *
   * @param error - The error thrown by the previous attempt.
   * @returns `true` to retry, `false` to stop.
   *
   * Default: always retry
   */
  shouldRetry?: (error: unknown) => boolean;

  /**
   * External {@link AbortSignal} used to cancel all attempts and retries.
   *
   * - Aborting this signal stops retries immediately.
   * - The signal is combined with a per-attempt abort signal.
   * - Aborting does NOT cancel operations that do not support AbortSignal.
   */
  signal?: AbortSignal;
};

/**
 * Executes an asynchronous action with retry support, exponential backoff,
 * optional jitter, per-attempt timeout, and {@link AbortController} cancellation.
 *
 * The action receives the current attempt index and an {@link AbortSignal}.
 * The signal should be passed to APIs that support cancellation (e.g. `fetch`,
 * `axios`, or custom logic).
 *
 * @typeParam T - The resolved value type of the action.
 *
 * @param action - Asynchronous function to execute.
 * Receives an object containing:
 * - `attempt`: Zero-based attempt index.
 * - `signal`: Abort signal for the current attempt.
 *
 * @param options - Optional retry configuration.
 *
 * @returns A promise that resolves with the successful result of `action`,
 * or rejects if all retries fail, retry conditions are not met,
 * or the operation is aborted.
 *
 * @throws {DOMException}
 * Throws an `AbortError` if the operation is aborted via `AbortController`.
 * ```
 */
export const retryAsync = async <T>(
  action: (ctx: { attempt: number; signal: AbortSignal }) => Promise<T>,
  {
    max = 2,
    delay = 300,
    maxDelay = 5e3, // 5000
    jitter = true,
    timeout,
    shouldRetry = () => true,
    signal: externalSignal,
  }: RetryOptions = {}
): Promise<T> => {
  let attempt = 0;

  // Combine external abort + per-attempt abort
  const createAttemptSignal = () => {
    const controller = new AbortController();

    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else {
        externalSignal.addEventListener(
          'abort',
          () => controller.abort(),
          { once: true }
        );
      }
    }

    return controller;
  };

  while (true) {
    const controller = createAttemptSignal();
    const { signal } = controller;

    // Optional timeout per attempt
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (timeout) {
      timeoutId = setTimeout(() => controller.abort(), timeout);
    }

    try {
      return await action({ attempt, signal });
    } 
    catch (err) {
      if (signal.aborted) {
        // Operation aborted
        throw new DOMException('Aborted', 'AbortError');
      }

      attempt++;

      if (attempt > max || !shouldRetry(err)) {
        throw err;
      }

      let fixDelay = Math.min(
        delay * 2 ** (attempt - 1),
        maxDelay
      );

      if (jitter) {
        fixDelay *= 0.5 + Math.random();
      }

      await new Promise(resolve => setTimeout(resolve, fixDelay));
    } 
    finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
}

/**
 * * @example
 * ```ts
 * retryAsync(
 *   ({ signal }) => fetch('/api/data', { signal }).then(r => r.json()),
 *   { max: 3, timeout: 5000 }
 * );
 * ```
 *
 * @example
 * ```ts
 * const controller = new AbortController();
 *
 * retryAsync(
 *   ({ signal }) => db.users.toArray(),
 *   {
 *     signal: controller.signal,
 *     shouldRetry: err => err?.name === 'UnknownError'
 *   }
 * );
 *
 * controller.abort();
 */