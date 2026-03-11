import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MuscleMap } from '../../components/muscle-map/MuscleMap';
import { ExercisePanel } from '../../components/muscle-map/ExercisePanel';
import HeaderLogin from '../../components/header/HeaderLogin.jsx';

const FemaleFrontMap = () => {
    const [viewMode, setViewMode] = useState("front");
    const [selectedMuscle, setSelectedMuscle] = useState(null);

    return (
        <div style={{ minHeight: "100vh", background: "#F8F9FC", color: "#1E293B" }}>
            <HeaderLogin />

            <main style={{ paddingTop: "80px", paddingBottom: "64px", paddingLeft: "24px", paddingRight: "24px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                    {/* ── Hero Header ──────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: -24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{ textAlign: "center", paddingTop: "32px", marginBottom: "32px" }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "6px",
                                padding: "4px 14px", borderRadius: "999px", marginBottom: "12px",
                                background: "#EEF2FF", color: "#6366F1", fontSize: "12px", fontWeight: 600,
                            }}
                        >
                            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366F1" }} />
                            Interactive Body Map
                        </motion.div>

                        <h1 style={{ fontSize: "48px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", margin: 0 }}>
                            Muscle Explorer
                        </h1>
                        <p style={{ fontSize: "15px", color: "#64748B", marginTop: "10px" }}>
                            Hover a muscle to preview · Click to discover exercises
                        </p>
                    </motion.div>

                    {/* ── Front / Back Toggle ──────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        style={{ display: "flex", justifyContent: "center", marginBottom: "36px" }}
                    >
                        <div style={{
                            display: "inline-flex", padding: "4px", borderRadius: "14px",
                            background: "#FFFFFF", border: "1px solid #E2E8F0",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                        }}>
                            {["front", "back"].map((mode) => (
                                <motion.button
                                    key={mode}
                                    onClick={() => { setViewMode(mode); setSelectedMuscle(null); }}
                                    whileTap={{ scale: 0.96 }}
                                    style={{
                                        position: "relative", padding: "8px 28px", borderRadius: "10px",
                                        fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer",
                                        textTransform: "capitalize", transition: "color 0.2s ease",
                                        background: viewMode === mode ? "#6366F1" : "transparent",
                                        color: viewMode === mode ? "#FFFFFF" : "#64748B",
                                    }}
                                >
                                    {mode === "front" ? "⬛ Front" : "⬜ Back"}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Main 2-column Layout ─────────────────────── */}
                    <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: "28px", alignItems: "start" }}>

                        {/* Left: Muscle Map */}
                        <motion.div
                            initial={{ opacity: 0, x: -32 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                        >
                            <MuscleMap view={viewMode} onMuscleSelect={setSelectedMuscle} />
                            <p style={{ textAlign: "center", fontSize: "12px", color: "#94A3B8", marginTop: "10px" }}>
                                ☝️ Click any region to load exercises
                            </p>
                        </motion.div>

                        {/* Right: Exercise Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 32 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedMuscle ?? "empty"}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ExercisePanel selectedMuscleId={selectedMuscle} />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FemaleFrontMap;