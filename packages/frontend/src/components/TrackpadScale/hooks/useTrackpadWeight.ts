import { useState, useEffect, useRef, useCallback } from "react";
import { spikeFilter }                               from "../utils/spikeFilter";
import { adaptiveEMA }                               from "../utils/adaptiveEMA";
import {
  initialLockingState,
  updateLockingState,
  LockingState,
} from "../utils/weightLocking";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

// ─── Constants ─────────────────────────────────────────────────────────────────
const POLL_MS       = 100;   // polling interval (ms)
const FETCH_TIMEOUT = 2000;  // network timeout — kept well above POLL_MS
const UI_MIN_DELTA  = 0.1;   // g – minimum change that triggers a React re-render

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useTrackpadWeight() {
  const [status,        setStatus]        = useState<ConnectionStatus>("connecting");
  const [weight,        setWeight]        = useState<number>(0);          // live filtered weight
  const [lockedWeight,  setLockedWeight]  = useState<number | null>(null);
  const [isStable,      setIsStable]      = useState(false);
  const [isLocked,      setIsLocked]      = useState(false);
  const [tareOffset,    setTareOffset]    = useState<number>(0);

  // ── Mutable signal-processing state (lives in refs, no re-renders) ─────────
  const lastAcceptedRef = useRef<number>(0); // last value that passed spike filter
  const filteredRef     = useRef<number>(0); // current AEMA output
  const lastWeightRef   = useRef<number>(0); // last value sent to React state
  const lockingRef      = useRef<LockingState>(initialLockingState());
  const timerRef        = useRef<number | null>(null);

  // ── Poll ───────────────────────────────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:9999/weight", {
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });
      if (!res.ok) throw new Error("non-OK response");

      const { weight: raw } = (await res.json()) as { weight: number };
      setStatus("connected");

      const grams = raw / 100; // server returns raw force units → convert to grams

      // 1. Spike filter — reject outliers > 30 g from last accepted
      const afterSpike = spikeFilter(grams, lastAcceptedRef.current, 30);
      if (afterSpike === null) return; // spike — skip this sample
      lastAcceptedRef.current = afterSpike;

      // 2. Adaptive EMA smoothing
      const filtered = adaptiveEMA(afterSpike, filteredRef.current);
      filteredRef.current = filtered;

      // 3. Weight locking state machine
      const nextLocking = updateLockingState(lockingRef.current, filtered);
      const prevState   = lockingRef.current.state;
      lockingRef.current = nextLocking;

      // 4. Sync React state (batch to minimise renders)
      setIsStable(nextLocking.state === "stabilizing" || nextLocking.state === "locked");
      setIsLocked(nextLocking.state === "locked");

      if (nextLocking.state === "locked" && nextLocking.lockedWeight !== null) {
        setLockedWeight(nextLocking.lockedWeight);
      } else if (prevState === "locked" && nextLocking.state !== "locked") {
        setLockedWeight(null);
      }

      // 5. Only push a weight update if change exceeds UI_MIN_DELTA
      const displayGrams = nextLocking.lockedWeight ?? filtered;
      if (Math.abs(displayGrams - lastWeightRef.current) >= UI_MIN_DELTA) {
        lastWeightRef.current = displayGrams;
        setWeight(displayGrams);
      }
    } catch {
      setStatus("disconnected");
    }
  }, []);

  // ── Polling loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      poll().finally(() => {
        timerRef.current = window.setTimeout(tick, POLL_MS);
      });
    };
    tick();
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [poll]);

  // ── Tare ──────────────────────────────────────────────────────────────────
  const setTare = useCallback(() => {
    const base = lockingRef.current.lockedWeight ?? filteredRef.current;
    setTareOffset(base);
  }, []);

  // ── Reset tare ────────────────────────────────────────────────────────────
  const tare = useCallback(() => {
    setTareOffset(0);
    lockingRef.current  = initialLockingState();
    filteredRef.current = 0;
    lastAcceptedRef.current = 0;
    lastWeightRef.current   = 0;
    setWeight(0);
    setLockedWeight(null);
    setIsStable(false);
    setIsLocked(false);
  }, []);

  const displayWeight = Math.max(0, weight - tareOffset);

  return { weight: displayWeight, lockedWeight, isStable, isLocked, status, tare, setTare };
}
