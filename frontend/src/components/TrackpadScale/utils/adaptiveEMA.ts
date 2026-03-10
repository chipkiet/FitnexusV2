/**
 * Adaptive Exponential Moving Average (AEMA)
 *
 * Uses a higher smoothing factor when the signal changes rapidly,
 * so the filter tracks fast changes while still suppressing noise at rest.
 *
 * Alpha selection:
 *   |diff| > 5g  →  alpha = 0.6  (follow the change quickly)
 *   |diff| > 1g  →  alpha = 0.3  (moderate tracking)
 *   else         →  alpha = 0.05 (heavy smoothing when near-stable)
 */
export function adaptiveEMA(measurement: number, previous: number): number {
  const diff = Math.abs(measurement - previous);

  const alpha =
    diff > 5 ? 0.6 :
    diff > 1 ? 0.3 :
               0.05;

  return alpha * measurement + (1 - alpha) * previous;
}
