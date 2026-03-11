import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MuscleHoverCard({ muscleInfo, position }) {
    return (
        <AnimatePresence>
            {muscleInfo && (
                <motion.div
                    key={muscleInfo.name}
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                        position: "fixed",
                        left: position.x,
                        top: position.y,
                        zIndex: 9999,
                        pointerEvents: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "999px",
                        background: "#1E293B",
                        color: "#F8FAFC",
                        fontSize: "12px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                        fontFamily: "inherit",
                    }}
                >
                    <span style={{ fontSize: "14px" }}></span>
                    <span>{muscleInfo.nameVi}</span>
                    <span style={{ color: "#94A3B8", fontWeight: 400 }}>· {muscleInfo.name}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}