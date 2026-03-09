import React, { useEffect } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import type { ConnectionStatus } from "./hooks/useTrackpadWeight";

type ScaleState = "measuring" | "stabilizing" | "locked";

interface Props {
    weight: number;
    status: ConnectionStatus;
    isStable: boolean;
    isLocked: boolean;
    onTare: () => void;  // reset
    onSetTare: () => void;  // zero at current weight
}

const STATE_CONFIG: Record<ScaleState, { label: string; dot: string; text: string }> = {
    measuring: { label: "● Measuring", dot: "bg-amber-400", text: "text-amber-400" },
    stabilizing: { label: "● Stabilizing", dot: "bg-blue-400", text: "text-blue-400" },
    locked: { label: "● Locked", dot: "bg-emerald-400", text: "text-emerald-400" },
};

export const ScaleDisplay: React.FC<Props> = ({
    weight, status, isStable, isLocked, onTare, onSetTare,
}) => {
    const scaleState: ScaleState = isLocked ? "locked" : isStable ? "stabilizing" : "measuring";
    const cfg = STATE_CONFIG[scaleState];

    // Spring-animated number
    const spring = useSpring(weight, { stiffness: 60, damping: 22, restDelta: 0.005 });
    useEffect(() => { spring.set(weight); }, [weight, spring]);
    const display = useTransform(spring, (v) => v.toFixed(1));

    const connected = status === "connected";

    return (
        <div className={`
      relative flex flex-col items-center gap-5 w-full max-w-xs
      rounded-[2rem] border p-8 pb-6
      bg-neutral-950 transition-all duration-700
      ${isLocked
                ? "border-emerald-500/40 shadow-[0_0_50px_-10px_rgba(52,211,153,0.25)]"
                : "border-neutral-800 shadow-2xl"
            }
    `}>

            {/* ── Top bar ── */}
            <div className="w-full flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-600 uppercase">
                    Digital Scale
                </span>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${connected ? "text-emerald-400 bg-emerald-500/10" : "text-neutral-500 bg-neutral-800"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
                    {status}
                </div>
            </div>

            {/* ── Weight LCD panel ── */}
            <div className={`
        relative w-full rounded-xl py-10 flex flex-col items-center gap-3
        bg-black/60 border transition-colors duration-700
        ${isLocked ? "border-emerald-500/20" : "border-neutral-900"}
      `}>

                {/* State badge */}
                <AnimatePresence mode="wait">
                    <motion.span
                        key={scaleState}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                        className={`absolute top-3 text-[10px] font-bold tracking-widest ${cfg.text} bg-black/40 px-3 py-1 rounded-full`}
                    >
                        {cfg.label}
                    </motion.span>
                </AnimatePresence>

                {/* Big number */}
                <div className="flex items-baseline gap-2 mt-4">
                    <motion.span
                        className={`text-8xl font-black tabular-nums tracking-tighter transition-colors duration-700 ${isLocked ? "text-emerald-300" : "text-white"
                            }`}
                    >
                        {display}
                    </motion.span>
                    <span className={`text-2xl font-bold transition-colors duration-700 ${isLocked ? "text-emerald-500/50" : "text-neutral-600"
                        }`}>g</span>
                </div>

                <p className={`text-xs font-medium tracking-wide transition-colors duration-500 ${isLocked ? "text-emerald-500/60" : (weight > 0 ? "text-neutral-500" : "text-neutral-700")
                    }`}>
                    {isLocked ? "Weight recorded" : (weight > 0 ? "Measuring…" : "Place object on trackpad")}
                </p>
            </div>

            {/* ── Action buttons ── */}
            <div className="w-full grid grid-cols-2 gap-3">
                <button
                    onClick={onSetTare}
                    disabled={!connected || weight === 0}
                    className="py-3 rounded-xl font-bold text-xs tracking-widest uppercase bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-300 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    Tare / Zero
                </button>
                <button
                    onClick={onTare}
                    disabled={!connected}
                    className={`py-3 rounded-xl font-bold text-xs tracking-widest uppercase active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed ${isLocked
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-900/30"
                        : "bg-neutral-100 hover:bg-white text-neutral-900"
                        }`}
                >
                    {isLocked ? "↺ New Weigh" : "Reset"}
                </button>
            </div>
        </div>
    );
};
