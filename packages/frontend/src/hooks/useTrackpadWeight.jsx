import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTrackpadWeight hook
 * Implements a signal processing pipeline for trackpad weight data:
 * Spike Filter -> Adaptive EMA -> Stability Detection -> Locking -> Tare
 */
export function useTrackpadWeight(baseUrl = 'http://localhost:9999') {
    const [weight, setWeight] = useState(0);
    const [lockedWeight, setLockedWeight] = useState(null);
    const [isStable, setIsStable] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [tareOffset, setTareOffset] = useState(0);
    const [error, setError] = useState(null);

    // Internal processing refs (to avoid re-renders on every micro-poll)
    const lastRawWeightRef = useRef(0);
    const currentEMARef = useRef(0);
    const lastStateWeightRef = useRef(0);

    // Stability tracking refs
    const stabilityStartWeightRef = useRef(0);
    const stabilityStartTimeRef = useRef(Date.now());

    // Polling interval
    // Use refs for the polling loop to avoid effect restarts on state changes
    const isLockedStateRef = useRef(isLocked);
    const lockedWeightStateRef = useRef(lockedWeight);
    const isStableStateRef = useRef(isStable);

    // Sync refs with state
    useEffect(() => {
        isLockedStateRef.current = isLocked;
        lockedWeightStateRef.current = lockedWeight;
        isStableStateRef.current = isStable;
    }, [isLocked, lockedWeight, isStable]);

    useEffect(() => {
        const poll = async () => {
            try {
                const response = await fetch(`${baseUrl}/weight`);
                if (!response.ok) throw new Error('API Error');
                const data = await response.json();
                // Chia 100 vì tín hiệu gốc có thể bị nhân nhầm tỷ lệ (VD: 12340 -> 123.4g)
                const measurement = data.weight;

                // 1. Spike / Outlier Filter 
                // We let the Adaptive EMA handle large jumps instead of completely blocking them.
                lastRawWeightRef.current = measurement;

                // 2. Adaptive Exponential Moving Average (EMA)
                const emaDiff = Math.abs(measurement - currentEMARef.current);
                let alpha;
                if (emaDiff > 10) alpha = 0.8; // Very fast response for sudden large changes
                else if (emaDiff > 3) alpha = 0.5; // Fast response for medium changes
                else alpha = 0.15; // Still smooths small jitters, but faster than 0.05

                const filteredWeight = alpha * measurement + (1 - alpha) * currentEMARef.current;
                currentEMARef.current = filteredWeight;

                // 3. Stable Weight Detection
                const stableDiff = Math.abs(filteredWeight - stabilityStartWeightRef.current);
                const now = Date.now();

                let stable = false;
                if (stableDiff < 0.5) { // Relaxed stability threshold from 0.2 to 0.5
                    if (now - stabilityStartTimeRef.current >= 500) { // Reduced timer from 800ms to 500ms
                        stable = true;
                    }
                } else {
                    stabilityStartWeightRef.current = filteredWeight;
                    stabilityStartTimeRef.current = now;
                }

                // 4. Weight Locking Logic
                let nextLockedStatus = isLockedStateRef.current;
                let nextLockedWeight = lockedWeightStateRef.current;

                if (!isLockedStateRef.current && stable && filteredWeight > 2) {
                    // Only lock if weight is meaningful (>2g) to prevent locking at 0
                    nextLockedStatus = true;
                    nextLockedWeight = filteredWeight;
                }

                // 5 & 6. Performance Optimized State Updates
                const stateDiff = Math.abs(filteredWeight - lastStateWeightRef.current);
                const shouldUpdateWeight =
                    stateDiff > 0.1 ||
                    nextLockedStatus !== isLockedStateRef.current ||
                    stable !== isStableStateRef.current;

                if (shouldUpdateWeight) {
                    setWeight(prev => {
                        if (Math.abs(prev - filteredWeight) > 0.05) return filteredWeight;
                        return prev;
                    });

                    lastStateWeightRef.current = filteredWeight;

                    setIsStable(prev => prev !== stable ? stable : prev);
                    setIsLocked(prev => prev !== nextLockedStatus ? nextLockedStatus : prev);
                    setLockedWeight(prev => prev !== nextLockedWeight ? nextLockedWeight : prev);
                }

                setError(null);
            } catch (err) {
                setError(err.message);
            }
        };

        const intervalId = setInterval(poll, 100);
        return () => clearInterval(intervalId);
    }, [baseUrl]); // Only depend on baseUrl

    const setTare = useCallback(async () => {
        try {
            // Priority 1: Call server API
            await fetch(`${baseUrl}/tare`, { method: 'POST' });
            // Priority 2: Set local offset to current Reading (to zero out immediately)
            setTareOffset(lockedWeight !== null ? lockedWeight : weight);
        } catch (err) {
            console.error('Tare failed:', err);
            // Fallback: Local tare only
            setTareOffset(lockedWeight !== null ? lockedWeight : weight);
        }
    }, [baseUrl, lockedWeight, weight]);

    const resetLock = useCallback(() => {
        setIsLocked(false);
        setLockedWeight(null);
        setIsStable(false);
        stabilityStartWeightRef.current = 0;
        stabilityStartTimeRef.current = Date.now();
    }, []);

    return {
        // displayWeight = (lockedWeight OR liveWeight) - tareOffset
        weight: (lockedWeight !== null ? lockedWeight : weight) - tareOffset,
        rawWeight: weight,
        lockedWeight,
        isStable,
        isLocked,
        tare: tareOffset,
        setTare,
        resetLock,
        error
    };
}
