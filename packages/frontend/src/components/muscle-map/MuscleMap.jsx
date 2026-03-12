import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ImageMapper from "react-img-mapper";
import { bodyMapFront, getMuscleInfo } from "./muscleMapData";
import { bodyMapBack } from "./muscleBackData";
import { MuscleHoverCard } from "./MuscleHoverCard";

// Width at which coordinates were originally mapped
const IMG_WIDTH = 448;

// Spatial suffixes that are never part of the muscle key itself
const SPATIAL_SUFFIXES = ["_right", "_left", "_center", "_upper", "_lower"];

/**
 * Given an area ID from the image map (e.g. "biceps_right", "rear_deltoids_left"),
 * return the key that exists in muscleExerciseMap.
 *
 * Strategy:
 *  1. Strip known spatial suffixes and check the remainder.
 *  2. Walk descending prefix lengths and return the first one that
 *     muscleInfoMap knows about (exact key only, no internal fallback).
 *  3. Last resort: first part of the underscore-split.
 */
const getCoreId = (areaId) => {
    if (!areaId) return null;

    // 1. Try stripping a known spatial suffix first (handles compound names
    //    like "rear_deltoids_right" → "rear_deltoids")
    for (const sfx of SPATIAL_SUFFIXES) {
        if (areaId.endsWith(sfx)) {
            const base = areaId.slice(0, -sfx.length);
            if (getMuscleInfo(base)) return base;   // exact key in muscleInfoMap
        }
    }

    // 2. If the id itself is an exact key in muscleInfoMap, just use it
    if (getMuscleInfo(areaId) && !SPATIAL_SUFFIXES.some(s => areaId.endsWith(s))) {
        return areaId;
    }

    // 3. Descending prefix walk (skips full length so "biceps_right" → "biceps")
    const parts = areaId.split("_");
    for (let len = parts.length - 1; len >= 1; len--) {
        const key = parts.slice(0, len).join("_");
        if (getMuscleInfo(key)) return key;
    }

    return parts[0];
};


export function MuscleMap({ view = "front", onMuscleSelect }) {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(IMG_WIDTH);
    const [muscleInfo, setMuscleInfo] = useState(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [activeArea, setActiveArea] = useState(null);

    const map = useMemo(() => view === "front" ? bodyMapFront : bodyMapBack, [view]);
    const src = view === "front" ? "/male-front.jpeg" : "/male-back.jpeg";

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) setContainerWidth(containerRef.current.offsetWidth);
        };
        updateWidth();
        const ro = new ResizeObserver(updateWidth);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const updateCursor = useCallback((event) => {
        const e = event?.nativeEvent || event;
        setCursorPos({ x: (e?.clientX ?? 0) + 16, y: (e?.clientY ?? 0) + 16 });
    }, []);

    const handleMouseEnter = useCallback((area, _i, event) => {
        if (!area?.id) return;
        setMuscleInfo(getMuscleInfo(area.id));
        setActiveArea(area.id);
        updateCursor(event);
    }, [updateCursor]);

    const handleMouseMove = useCallback((_a, _i, event) => {
        updateCursor(event);
    }, [updateCursor]);

    const handleMouseLeave = useCallback(() => {
        setMuscleInfo(null);
        setActiveArea(null);
    }, []);

    const handleClick = useCallback((area) => {
        if (!area?.id) return;
        onMuscleSelect?.(getCoreId(area.id));
    }, [onMuscleSelect]);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "18px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                    overflow: "hidden",
                }}
            >
                {/* Top accent bar */}
                <div style={{ height: "3px", background: "#6366F1" }} />

                {/* Image mapper container */}
                <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
                    <ImageMapper
                        src={src}
                        name={map.name}
                        areas={map.areas}
                        imgWidth={IMG_WIDTH}
                        parentWidth={containerWidth}
                        responsive
                        onMouseEnter={handleMouseEnter}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleClick}
                    />
                </div>

                {/* Footer */}
                <div style={{
                    padding: "10px 16px", borderTop: "1px solid #F1F5F9",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                }}>
                    <motion.span
                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#6366F1", display: "inline-block" }}
                    />
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>Hover to preview · Click to select</span>
                </div>
            </motion.div>

            <MuscleHoverCard muscleInfo={muscleInfo} position={cursorPos} />
        </>
    );
}