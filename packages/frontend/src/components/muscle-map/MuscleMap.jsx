import React, { useState, useMemo, useCallback } from "react";
import ImageMapper from "react-img-mapper";
import { bodyMap, getMuscleInfo } from "./muscleMapData";
import { MuscleHoverCard } from "./MuscleHoverCard";

const IMAGE_WIDTH = 336; // chỉnh theo width ảnh thật của bạn

export function MuscleMap() {

    const [hoveredArea, setHoveredArea] = useState(null);
    const [muscleInfo, setMuscleInfo] = useState(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    const map = useMemo(() => bodyMap, []);

    const updateCursor = (event) => {
        const e = event?.nativeEvent || event;

        setCursorPos({
            x: (e?.clientX ?? 0) + 12,
            y: (e?.clientY ?? 0) + 12
        });
    };

    const handleMouseEnter = useCallback((area, index, event) => {

        if (!area?.id) return;

        setHoveredArea(area);

        const info = getMuscleInfo(area.id);

        setMuscleInfo(info);

        updateCursor(event);

    }, []);

    const handleMouseMove = useCallback((area, index, event) => {
        updateCursor(event);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredArea(null);
        setMuscleInfo(null);
    }, []);

    return (
        <div className="relative flex justify-center">

            <ImageMapper
                src="/male-front.jpeg"
                name={map.name}
                areas={map.areas}
                width={IMAGE_WIDTH}
                responsive
                parentWidth={448}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />

            <MuscleHoverCard
                muscleInfo={muscleInfo}
                position={cursorPos}
            />

        </div>
    );
}