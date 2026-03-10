/**
 * Weight Locking State Machine
 *
 * Tracks whether a weight reading has stabilised and should be locked,
 * and when it should be released.
 *
 * Stable criteria  : |filtered - stableBase| ≤ 0.2 g for ≥ 800 ms
 * Unlock criteria  : |filtered - lockedValue| > 2 g  OR  filtered < 5 g
 */

export type WeightState = "measuring" | "stabilizing" | "locked";

export interface LockingState {
  state:        WeightState;
  lockedWeight: number | null;
  stableBase:   number;
  stableSince:  number | null; // timestamp
}

export function initialLockingState(): LockingState {
  return {
    state:        "measuring",
    lockedWeight: null,
    stableBase:   0,
    stableSince:  null,
  };
}

const STABLE_RANGE = 0.2; // g
const STABLE_MS    = 800; // ms
const UNLOCK_DELTA = 2;   // g
const EMPTY_THRESH = 5;   // g – below this → object removed

export function updateLockingState(
  prev: LockingState,
  filtered: number,
  now  = Date.now(),
): LockingState {
  const isEffectivelyEmpty = filtered < EMPTY_THRESH;

  // ── If already locked ──────────────────────────────────────────────────────
  if (prev.state === "locked" && prev.lockedWeight !== null) {
    const unlock =
      isEffectivelyEmpty ||
      Math.abs(filtered - prev.lockedWeight) > UNLOCK_DELTA;

    if (unlock) {
      return { ...initialLockingState(), stableBase: filtered };
    }
    return prev; // still locked — no change
  }

  // ── If measuring / stabilizing ─────────────────────────────────────────────
  if (isEffectivelyEmpty) {
    return { ...initialLockingState(), stableBase: filtered };
  }

  const withinBand = Math.abs(filtered - prev.stableBase) <= STABLE_RANGE;

  if (!withinBand) {
    // Drifted — restart window
    return {
      state:        "measuring",
      lockedWeight: null,
      stableBase:   filtered,
      stableSince:  now,
    };
  }

  // Within stable band
  const since = prev.stableSince ?? now;
  const elapsed = now - since;

  if (elapsed >= STABLE_MS) {
    // Lock achieved!
    return {
      state:        "locked",
      lockedWeight: filtered,
      stableBase:   filtered,
      stableSince:  since,
    };
  }

  return {
    state:        "stabilizing",
    lockedWeight: null,
    stableBase:   prev.stableBase,
    stableSince:  since,
  };
}
