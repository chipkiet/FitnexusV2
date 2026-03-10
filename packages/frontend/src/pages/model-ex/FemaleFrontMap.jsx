import React, { useState } from 'react';
import { MuscleMap } from '../../components/muscle-map/MuscleMap';
import { ExercisePanel } from '../../components/muscle-map/ExercisePanel';
import { Button } from '../../components/ui/button';
import HeaderLogin from '../../components/header/HeaderLogin.jsx';

const FemaleFrontMap = () => {

    const [viewMode, setViewMode] = useState("front");
    const [selectedMuscle, setSelectedMuscle] = useState(null);

    return (
        <>
            <HeaderLogin />

            <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-12 px-4">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* ── Page Header ─────────────────────────────────────── */}
                    <div className="text-center space-y-1.5 pt-4">
                        <h1 className="text-3xl font-bold tracking-tight">Muscle Explorer</h1>
                        <p className="text-muted-foreground text-sm">
                            Hover a muscle group to preview · Click to load exercises
                        </p>
                    </div>

                    {/* ── Front / Back Toggle ──────────────────────────────── */}
                    <div className="flex justify-center">
                        <div className="inline-flex gap-1 rounded-xl border bg-muted p-1 shadow-sm">
                            <Button
                                variant={viewMode === "front" ? "default" : "ghost"}
                                size="sm"
                                className="rounded-lg px-5"
                                onClick={() => {
                                    setViewMode("front");
                                    setSelectedMuscle(null);
                                }}
                            >
                                Front
                            </Button>
                            <Button
                                variant={viewMode === "back" ? "default" : "ghost"}
                                size="sm"
                                className="rounded-lg px-5"
                                onClick={() => {
                                    setViewMode("back");
                                    setSelectedMuscle(null);
                                }}
                            >
                                Back
                            </Button>
                        </div>
                    </div>

                    {/* ── Main Content: 2-column on desktop, stacked on mobile ── */}
                    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">

                        {/* Left: Muscle Map */}
                        <div className="w-full md:w-[380px] lg:w-[420px] mx-auto md:mx-0">
                            <MuscleMap
                                view={viewMode}
                                onMuscleSelect={setSelectedMuscle}
                            />
                            <p className="text-center text-xs text-muted-foreground mt-3">
                                Click a muscle to view exercises
                            </p>
                        </div>

                        {/* Right: Exercise Panel */}
                        <div className="w-full">
                            <ExercisePanel selectedMuscleId={selectedMuscle} />
                        </div>

                    </div>
                </div>
            </main>
        </>
    );
};

export default FemaleFrontMap;