import { useState } from "react";
import { useTrackpadWeight } from "./hooks/useTrackpadWeight";
import { ScaleDisplay } from "./ScaleDisplay";
import { AnimatePresence, motion } from "framer-motion";

export interface TrackpadScaleProps {
    /** Hàm callback được gọi khi người dùng bấm nút "Sử dụng mức cân này" */
    onConfirm?: (weight: number) => void;
    /** Class CSS cho nút mở cân ở ngoài màn hình chính */
    triggerClassName?: string;
    /** Nội dung chữ hiển thị trên nút mở cân */
    triggerText?: React.ReactNode;
}

/**
 * TrackpadScale
 * 
 * A self-contained digital scale component that connects to a local 
 * trackpad-weight server via HTTP.
 * 
 * Simply drop this folder into any React project (requires framer-motion and tailwindcss)
 * and mount `<TrackpadScale />`.
 */
export function TrackpadScale({
    onConfirm,
    triggerClassName = "h-14 rounded-md px-8 text-base font-bold tracking-widest uppercase bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl shadow-emerald-500/20 active:scale-95 transition-all outline-none",
    triggerText = "Mở Cân Điện Tử",
}: TrackpadScaleProps) {
    const { weight, status, isStable, isLocked, tare, setTare } = useTrackpadWeight();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={triggerClassName}
            >
                {triggerText}
            </button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative z-10 flex justify-center w-full max-w-md"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors p-2"
                                aria-label="Close scale"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>

                            <div className="flex flex-col w-full gap-4">
                                <ScaleDisplay
                                    weight={weight}
                                    status={status}
                                    isStable={isStable}
                                    isLocked={isLocked}
                                    onTare={tare}
                                    onSetTare={setTare}
                                />

                                {/* Confirm Button added below Scale */}
                                {onConfirm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const finalWeight = isLocked && status === "connected" ? weight : weight;
                                            onConfirm(finalWeight);
                                            setIsOpen(false);
                                        }}
                                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl text-lg uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                    >
                                        Sử dụng: {weight} g
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
