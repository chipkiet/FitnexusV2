/**
 * Spike filter — ignores measurements that deviate too far from the last
 * accepted value. Returns null when the sample is considered a spike.
 */
export function spikeFilter(
  measurement: number,
  lastAccepted: number,
  maxDelta = 30,
): number | null {
  if (Math.abs(measurement - lastAccepted) > maxDelta) return null; // spike — reject
  return measurement;
}
