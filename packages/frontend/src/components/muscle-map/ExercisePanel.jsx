import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchExercisesForMuscle } from "./exerciseService";
import { getMuscleInfo } from "./muscleMapData";

export function ExercisePanel({ selectedMuscleId }) {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);

    const muscleInfo = selectedMuscleId ? getMuscleInfo(selectedMuscleId) : null;

    useEffect(() => {
        if (!selectedMuscleId) { setExercises([]); return; }
        setLoading(true);
        fetchExercisesForMuscle(selectedMuscleId)
            .then(setExercises)
            .finally(() => setLoading(false));
    }, [selectedMuscleId]);

    const cardStyle = {
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "18px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        minHeight: "320px",
        overflow: "hidden",
    };

    const topBar = <div style={{ height: "3px", background: "#6366F1" }} />;

    // ─── Empty state ──────────────────────────────────────────────────────────
    if (!selectedMuscleId) {
        return (
            <motion.div
                style={cardStyle}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {topBar}
                <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", minHeight: "320px", padding: "40px 24px",
                    gap: "14px", textAlign: "center"
                }}>
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        style={{
                            width: "64px", height: "64px", borderRadius: "50%",
                            background: "#EEF2FF", display: "flex",
                            alignItems: "center", justifyContent: "center", fontSize: "28px",
                        }}
                    >
                        🫀
                    </motion.div>
                    <div>
                        <p style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B", marginBottom: "6px" }}>
                            Select a Muscle Group
                        </p>
                        <p style={{ fontSize: "13px", color: "#94A3B8", maxWidth: "210px", lineHeight: 1.6 }}>
                            Click any highlighted region on the body map to discover exercises
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                        {[0, 1, 2].map(i => (
                            <motion.span
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.2 }}
                                style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366F1", display: "inline-block" }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    }

    // ─── Loading skeleton ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <motion.div style={cardStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {topBar}
                <div style={{ padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <motion.div
                            animate={{ opacity: [0.4, 0.9, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.4 }}
                            style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#E2E8F0" }}
                        />
                        <div>
                            {[120, 70].map((w, i) => (
                                <motion.div key={i} animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.1 }}
                                    style={{ width: `${w}px`, height: i === 0 ? 14 : 10, borderRadius: "6px", background: "#E2E8F0", marginBottom: i === 0 ? 6 : 0 }}
                                />
                            ))}
                        </div>
                    </div>
                    <div style={{ height: "1px", background: "#F1F5F9", marginBottom: "16px" }} />
                    {[70, 50, 60, 45].map((w, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.1 }}
                                style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#E2E8F0", flexShrink: 0 }}
                            />
                            <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.12 }}
                                style={{ width: `${w}%`, height: 12, borderRadius: "6px", background: "#E2E8F0" }}
                            />
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    }

    // ─── Populated state ──────────────────────────────────────────────────────
    return (
        <motion.div style={cardStyle} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {topBar}

            {/* Header */}
            <div style={{ padding: "18px 24px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 280, damping: 18 }}
                        style={{
                            width: "44px", height: "44px", borderRadius: "12px",
                            background: "#EEF2FF", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "22px", flexShrink: 0,
                        }}
                    >
                        {muscleInfo?.icon}
                    </motion.div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "16px", fontWeight: 700, color: "#1E293B" }}>
                            {muscleInfo?.name ?? selectedMuscleId}
                        </p>
                        {muscleInfo?.nameVi && (
                            <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "2px" }}>{muscleInfo.nameVi}</p>
                        )}
                    </div>
                    <div style={{
                        padding: "4px 12px", borderRadius: "999px",
                        background: "#EEF2FF", fontSize: "12px", fontWeight: 600, color: "#6366F1",
                    }}>
                        {exercises.length} exercises
                    </div>
                </div>
            </div>

            <div style={{ height: "1px", background: "#F1F5F9", margin: "0 24px" }} />

            {/* Exercise list */}
            <div style={{ padding: "14px 24px 20px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6366F1", marginBottom: "10px" }}>
                    Exercises
                </p>
                <div style={{ maxHeight: "420px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                    {exercises.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#94A3B8", fontStyle: "italic" }}>No exercises found for this muscle.</p>
                    ) : (
                        <AnimatePresence>
                            {exercises.map((ex, i) => (
                                <motion.button
                                    key={ex.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04, duration: 0.25 }}
                                    whileHover={{ x: 6, backgroundColor: "#F5F3FF" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigate(`/exercises/${ex.id}`)}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", gap: "12px",
                                        padding: "9px 10px", borderRadius: "10px", background: "transparent",
                                        border: "none", cursor: "pointer", textAlign: "left",
                                    }}
                                >
                                    <span style={{
                                        width: "7px", height: "7px", borderRadius: "50%",
                                        background: "#6366F1", flexShrink: 0,
                                    }} />
                                    <span style={{ fontSize: "13px", color: "#334155", flex: 1 }}>{ex.name}</span>
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        style={{ fontSize: "14px", color: "#6366F1" }}
                                    >›</motion.span>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
