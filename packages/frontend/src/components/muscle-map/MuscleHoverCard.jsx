import { motion, AnimatePresence } from "framer-motion";

export function MuscleHoverCard({ muscleInfo, position }) {
    return (
        <AnimatePresence>
            {muscleInfo && (
                <motion.div
                    key={muscleInfo.name}
                    initial={{ opacity: 0, scale: 0.92, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{
                        position: "fixed",
                        left: position.x,
                        top: position.y,
                        zIndex: 999,
                        pointerEvents: "none",
                        width: "220px",
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderLeft: "4px solid #6366F1",
                        borderRadius: "14px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <div style={{ padding: "12px 14px 10px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            width: "34px", height: "34px", borderRadius: "9px",
                            background: "#EEF2FF", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "17px", flexShrink: 0,
                        }}>
                            {muscleInfo.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "#1E293B", lineHeight: 1.2 }}>
                                {muscleInfo.name}
                            </p>
                            {muscleInfo.nameVi && (
                                <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "1px" }}>{muscleInfo.nameVi}</p>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: "1px", background: "#F1F5F9", margin: "0 14px" }} />

                    {/* Exercises */}
                    <div style={{ padding: "10px 14px 12px" }}>
                        <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6366F1", marginBottom: "8px" }}>
                            Top Exercises
                        </p>
                        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
                            {muscleInfo.exercises.map((ex, i) => (
                                <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#475569" }}>
                                    <span style={{
                                        width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0,
                                        background: i === 0 ? "#6366F1" : i === 1 ? "#818CF8" : "#A5B4FC"
                                    }} />
                                    {ex}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}