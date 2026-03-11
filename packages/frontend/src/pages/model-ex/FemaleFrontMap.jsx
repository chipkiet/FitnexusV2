import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MuscleMap } from '../../components/muscle-map/MuscleMap';
import { ExercisePanel } from '../../components/muscle-map/ExercisePanel';
import HeaderLogin from '../../components/header/HeaderLogin.jsx';

const VIEWS = [
    { key: "front", label: "Trước", icon: "🫀" },
    { key: "back",  label: "Sau",   icon: "🔙" },
];

const FemaleFrontMap = () => {
    const [viewMode, setViewMode] = useState("front");
    const [selectedMuscle, setSelectedMuscle] = useState(null);

    return (
        <div style={{ minHeight: "100vh", background: "#F8F9FC", color: "#1E293B" }}>
            <HeaderLogin />

            <main style={{ paddingTop: "80px", paddingBottom: "64px", paddingLeft: "20px", paddingRight: "20px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                    {/* ── Hero Header ──────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        style={{ textAlign: "center", paddingTop: "32px", marginBottom: "28px" }}
                    >
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            padding: "4px 14px", borderRadius: "999px", marginBottom: "12px",
                            background: "#EEF2FF", color: "#6366F1", fontSize: "12px", fontWeight: 600,
                            border: "1px solid #C7D2FE",
                        }}>
                            <motion.span
                                animate={{ scale: [1, 1.35, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{ width: 7, height: 7, borderRadius: "50%", background: "#6366F1", display: "inline-block" }}
                            />
                            Interactive Body Map
                        </div>

                        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", margin: 0 }}>
                            Muscle Explorer
                        </h1>
                        <p style={{ fontSize: "14px", color: "#64748B", marginTop: "8px" }}>
                            Hover a muscle to see its name · Click to discover exercises
                        </p>
                    </motion.div>

                    {/* ── Front / Back Toggle ──────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.4 }}
                        style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}
                    >
                        <div style={{
                            display: "inline-flex", padding: "4px", borderRadius: "14px",
                            background: "#FFFFFF", border: "1px solid #E2E8F0",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        }}>
                            {VIEWS.map((v) => (
                                <motion.button
                                    key={v.key}
                                    onClick={() => { setViewMode(v.key); setSelectedMuscle(null); }}
                                    whileTap={{ scale: 0.96 }}
                                    style={{
                                        padding: "8px 24px", borderRadius: "10px",
                                        fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer",
                                        background: viewMode === v.key ? "#6366F1" : "transparent",
                                        color: viewMode === v.key ? "#FFFFFF" : "#64748B",
                                        display: "flex", alignItems: "center", gap: "6px",
                                        transition: "background 0.2s, color 0.2s",
                                    }}
                                >
                                    <span>{v.icon}</span> {v.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Main 2-column Layout ─────────────────────── */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(280px, 420px) 1fr",
                        gap: "24px",
                        alignItems: "start",
                    }}>

                        {/* Left: Muscle Map */}
                        <motion.div
                            initial={{ opacity: 0, x: -28 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
                        >
                            <MuscleMap view={viewMode} onMuscleSelect={setSelectedMuscle} />
                            <p style={{ textAlign: "center", fontSize: "11px", color: "#CBD5E1", marginTop: "8px" }}>
                                Hover to preview · Click to select
                            </p>
                        </motion.div>

                        {/* Right: Exercise Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 28 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedMuscle ?? "empty"}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <ExercisePanel selectedMuscleId={selectedMuscle} />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Responsive: stack on small screens */}
            <style>{`
                @media (max-width: 700px) {
                    div[style*="minmax(280px"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default FemaleFrontMap;