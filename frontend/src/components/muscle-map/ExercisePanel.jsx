import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchExercisesForMuscle } from "./exerciseService";
import { getMuscleInfo } from "./muscleMapData";

export function ExercisePanel({ selectedMuscleId }) {

    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);

    const muscleInfo = selectedMuscleId ? getMuscleInfo(selectedMuscleId) : null;

    useEffect(() => {
        if (!selectedMuscleId) {
            setExercises([]);
            return;
        }
        setLoading(true);
        fetchExercisesForMuscle(selectedMuscleId)
            .then(setExercises)
            .finally(() => setLoading(false));
    }, [selectedMuscleId]);

    // ─── Empty state ──────────────────────────────────────────────────────────
    if (!selectedMuscleId) {
        return (
            <Card className="h-full rounded-xl border shadow-sm">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] gap-3 text-center p-8">
                    <span className="text-5xl">🫀</span>
                    <p className="font-medium text-base">Select a muscle</p>
                    <p className="text-sm text-muted-foreground">
                        Click any highlighted region on the body map to see exercises
                    </p>
                </CardContent>
            </Card>
        );
    }

    // ─── Loading skeleton ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <Card className="h-full rounded-xl border shadow-sm">
                <CardHeader className="pb-3">
                    <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-3.5 w-20 rounded bg-muted animate-pulse mt-1" />
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-muted animate-pulse shrink-0" />
                            <div className="h-4 rounded bg-muted animate-pulse" style={{ width: `${50 + i * 10}%` }} />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    // ─── Populated state ──────────────────────────────────────────────────────
    return (
        <Card className="h-full rounded-xl border shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{muscleInfo?.icon}</span>
                    <div>
                        <CardTitle className="text-base leading-tight">
                            {muscleInfo?.name ?? selectedMuscleId}
                        </CardTitle>
                        {muscleInfo?.nameVi && (
                            <p className="text-xs text-muted-foreground">{muscleInfo.nameVi}</p>
                        )}
                    </div>
                    <Badge variant="secondary" className="ml-auto text-xs">
                        {exercises.length} exercises
                    </Badge>
                </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4 p-0">
                <ScrollArea className="h-72 px-6 pb-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Exercises
                    </p>
                    <ul className="space-y-2">
                        {exercises.map((ex, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-3 text-sm group cursor-default"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
                                <span className="group-hover:text-primary transition-colors">{ex}</span>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
