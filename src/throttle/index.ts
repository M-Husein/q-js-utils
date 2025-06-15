/**
 * Creates a throttled function that invokes `func` at most once per `wait` milliseconds.
 * 
 * @template T - The type of the function to throttle.
 * @param {T} func - The function to throttle.
 * @param {number} [wait=300] - The throttle interval in milliseconds.
 * @returns {(...args: Parameters<T>) => void} - The throttled function.
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  wait: number = 300
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    let now = Date.now();
    if (now - lastCall >= wait) {
      func(...args);
      lastCall = now;
    }
  };
}
