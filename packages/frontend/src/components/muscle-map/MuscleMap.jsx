import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import ImageMapper from "react-img-mapper";
import { bodyMapFront, getMuscleInfo } from "./muscleMapData";
import { bodyMapBack } from "./muscleBackData";
import { MuscleHoverCard } from "./MuscleHoverCard";
import { Card, CardContent } from "@/components/ui/card";

// Width at which coordinates were originally mapped
const IMG_WIDTH = 448;

// Mirrors getMuscleInfo's longest-prefix logic to derive the exercise group key
const getCoreId = (areaId) => {
    if (!areaId) return null;
    const info = getMuscleInfo(areaId);
    if (!info) return areaId.split("_")[0];
    // Find which key matched by testing prefixes longest-first
    const parts = areaId.split("_");
    for (let len = parts.length; len >= 1; len--) {
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

    const map = useMemo(() =>
        view === "front" ? bodyMapFront : bodyMapBack,
        [view]);

    const src = view === "front" ? "/male-front.jpeg" : "/male-back.jpeg";

    // Dynamically measure the container to keep parentWidth in sync
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        const ro = new ResizeObserver(updateWidth);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    const updateCursor = useCallback((event) => {
        const e = event?.nativeEvent || event;
        setCursorPos({
            x: (e?.clientX ?? 0) + 16,
            y: (e?.clientY ?? 0) + 16,
        });
    }, []);

    const handleMouseEnter = useCallback((area, _i, event) => {
        if (!area?.id) return;
        setMuscleInfo(getMuscleInfo(area.id));
        updateCursor(event);
    }, [updateCursor]);

    const handleMouseMove = useCallback((_a, _i, event) => {
        updateCursor(event);
    }, [updateCursor]);

    const handleMouseLeave = useCallback(() => {
        setMuscleInfo(null);
    }, []);

    const handleClick = useCallback((area) => {
        if (!area?.id) return;
        onMuscleSelect?.(getCoreId(area.id));
    }, [onMuscleSelect]);

    return (
        <>
            {/* Card wraps the mapper with no internal padding */}
            <Card className="w-full shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-0">
                    {/*
                        CRITICAL: ref'd container — zero padding/margin/transforms.
                        parentWidth derives from this element's offsetWidth.
                    */}
                    <div ref={containerRef} className="relative w-full">
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
                </CardContent>
            </Card>

            {/* Floating hover card — outside mapper layout tree */}
            <MuscleHoverCard muscleInfo={muscleInfo} position={cursorPos} />
        </>
    );
}