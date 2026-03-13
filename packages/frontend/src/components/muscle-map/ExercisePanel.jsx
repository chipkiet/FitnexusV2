import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchExercisesForMuscle } from "./exerciseService";
import { getMuscleInfo } from "./muscleMapData";

export function ExercisePanel({ selectedMuscleId }) {
    const navigate = useNavigate();
    const [fetchedExercises, setFetchedExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState("All");

    const muscleInfo = selectedMuscleId ? getMuscleInfo(selectedMuscleId) : null;

    useEffect(() => {
        if (!selectedMuscleId) { setFetchedExercises([]); return; }
        setLoading(true);
        // Reset filter when changing muscles
        setActiveFilter("All");
        fetchExercisesForMuscle(selectedMuscleId)
            .then(setFetchedExercises)
            .finally(() => setLoading(false));
    }, [selectedMuscleId]);

    // Mock data for premium experience fallback
    const mockDb = {
        chest: [
            { id: '1', name: 'Bench Press', equipment: 'Barbell', level: 'Intermediate' },
            { id: '2', name: 'Incline Dumbbell Press', equipment: 'Dumbbell', level: 'Intermediate' },
            { id: '3', name: 'Push-ups', equipment: 'Bodyweight', level: 'Beginner' },
            { id: '4', name: 'Cable Crossover', equipment: 'Cable', level: 'Advanced' },
        ],
        back: [
            { id: '5', name: 'Pull-ups', equipment: 'Bodyweight', level: 'Intermediate' },
            { id: '6', name: 'Barbell Row', equipment: 'Barbell', level: 'Intermediate' },
            { id: '7', name: 'Lat Pulldown', equipment: 'Cable', level: 'Beginner' },
        ],
        legs: [
            { id: '8', name: 'Squats', equipment: 'Barbell', level: 'Intermediate' },
            { id: '9', name: 'Lunges', equipment: 'Dumbbell', level: 'Beginner' },
            { id: '10', name: 'Leg Press', equipment: 'Machine', level: 'Beginner' },
        ],
        shoulders: [
            { id: '11', name: 'Overhead Press', equipment: 'Barbell', level: 'Intermediate' },
            { id: '12', name: 'Lateral Raises', equipment: 'Dumbbell', level: 'Beginner' },
        ],
        arms: [
            { id: '13', name: 'Bicep Curls', equipment: 'Dumbbell', level: 'Beginner' },
            { id: '14', name: 'Tricep Extensions', equipment: 'Cable', level: 'Beginner' },
        ],
        core: [
            { id: '15', name: 'Plank', equipment: 'Bodyweight', level: 'Beginner' },
            { id: '16', name: 'Cable Crunches', equipment: 'Cable', level: 'Intermediate' },
        ]
    };

    // Use mock specific data or augment fetched ones
    const exercises = useMemo(() => {
        if (!selectedMuscleId) return [];
        
        const muscleKey = selectedMuscleId.toLowerCase();
        if (mockDb[muscleKey]) {
            return mockDb[muscleKey];
        }
        
        const equipments = ["Barbell", "Dumbbell", "Bodyweight", "Cable", "Machine"];
        const levels = ["Beginner", "Intermediate", "Advanced"];
        
        return fetchedExercises.map((ex, idx) => ({
            ...ex,
            equipment: ex.equipment || equipments[idx % equipments.length],
            level: ex.level || levels[idx % levels.length]
        }));
    }, [selectedMuscleId, fetchedExercises]);

    const filters = ["All", "Barbell", "Dumbbell", "Bodyweight", "Cable", "Machine"];

    const filteredExercises = exercises.filter(ex => 
        activeFilter === "All" || ex.equipment === activeFilter
    );

    const containerClasses = "bg-[#F8F9FC] border border-slate-200 rounded-[20px] shadow-sm flex flex-col overflow-hidden";
    const containerStyle = { height: "680px" };

    // ─── Empty state ──────────────────────────────────────────────────────────
    if (!selectedMuscleId) {
        return (
            <motion.div
                className={containerClasses}
                style={containerStyle}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="h-1 bg-indigo-500 w-full" />
                <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-4xl mb-6 shadow-sm border border-indigo-100"
                    >
                        💪
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        Select a Muscle
                    </h3>
                    <p className="text-sm text-slate-500 max-w-[240px] leading-relaxed">
                        Click on the body map to explore exercises.
                    </p>
                </div>
            </motion.div>
        );
    }

    // ─── Loading skeleton ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <motion.div className={containerClasses} style={containerStyle} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="h-1 bg-indigo-500 w-full shrink-0" />
                <div className="p-6 shrink-0">
                    <div className="flex items-center gap-4 mb-6">
                        <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }}
                            className="w-14 h-14 rounded-[16px] bg-slate-200" />
                        <div>
                            <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }}
                                className="w-32 h-4 rounded-md bg-slate-200 mb-2" />
                            <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.1 }}
                                className="w-20 h-3 rounded-md bg-slate-200" />
                        </div>
                    </div>
                </div>
                <div className="flex-1 px-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-4 mb-3 bg-white p-4 rounded-[16px] border border-slate-100">
                            <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.1 }}
                                className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                            <div className="flex-1 py-1">
                                <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: (i*0.1) + 0.1 }}
                                    className="w-3/4 h-3.5 rounded bg-slate-200 mb-2" />
                                <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: (i*0.1) + 0.2 }}
                                    className="w-1/2 h-3 rounded bg-slate-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    }

    const equipmentIcons = {
        Barbell: "🏋️",
        Dumbbell: "💪",
        Bodyweight: "🤸",
        Cable: "🔗",
        Machine: "⚙️"
    };

    const levelColors = {
        Beginner: "bg-emerald-100 text-emerald-700",
        Intermediate: "bg-sky-100 text-sky-700",
        Advanced: "bg-rose-100 text-rose-700"
    };

    // ─── Populated state ──────────────────────────────────────────────────────
    return (
        <motion.div 
            className={containerClasses} 
            style={containerStyle} 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.35 }}
        >
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            
            <div className="h-1 bg-indigo-500 w-full shrink-0" />

            {/* Sticky Header */}
            <div className="sticky top-0 bg-[#F8F9FC] z-10 p-5 md:p-6 pb-2 border-b border-slate-200/60 shadow-sm shrink-0">
                {/* Top Row: Icon + Name + Badge */}
                <div className="flex items-center gap-4 mb-5">
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 280, damping: 18 }}
                        className="w-14 h-14 rounded-[16px] bg-white border border-slate-100 shadow-sm flex items-center justify-center text-2xl shrink-0"
                    >
                        {muscleInfo?.icon || "🎯"}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-extrabold text-[#1E293B] truncate tracking-tight">
                            {muscleInfo?.name ?? selectedMuscleId}
                        </h2>
                        {muscleInfo?.nameVi && (
                            <p className="text-[13px] font-medium text-slate-500 mt-0.5">{muscleInfo.nameVi}</p>
                        )}
                    </div>
                    <div className="px-3 md:px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs md:text-sm font-bold shadow-sm whitespace-nowrap">
                        {filteredExercises.length} {filteredExercises.length === 1 ? 'Exercise' : 'Exercises'}
                    </div>
                </div>

                {/* Filter Row */}
                <div className="flex overflow-x-auto gap-2 pb-4 hide-scrollbar">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all duration-200
                                ${activeFilter === filter 
                                    ? "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)]" 
                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
                <AnimatePresence mode="popLayout">
                    {filteredExercises.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-12 text-center h-full"
                        >
                            <span className="text-4xl mb-4 opacity-50">🔍</span>
                            <p className="text-[15px] text-slate-500 font-medium">No exercises match your filter.</p>
                            <button 
                                onClick={() => setActiveFilter("All")}
                                className="mt-3 text-[14px] text-indigo-600 font-bold hover:underline"
                            >
                                Clear filters
                            </button>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filteredExercises.map((ex, i) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25 }}
                                    whileHover={{ x: 6, y: -2 }}
                                    key={ex.id || ex.name}
                                    onClick={() => navigate(`/exercises/${ex.id || 'placeholder'}`)}
                                    className="group relative flex items-center gap-4 bg-[#F8F9FC] border border-slate-200 p-4 rounded-[16px] cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:border-indigo-200"
                                >
                                    {/* Left: Equipment Icon */}
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 group-hover:bg-indigo-50 transition-colors">
                                        {equipmentIcons[ex.equipment] || "⚡"}
                                    </div>

                                    {/* Center: Title & Info */}
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <h4 className="text-[15px] font-bold text-slate-800 truncate mb-1.5 group-hover:text-indigo-600 transition-colors">
                                            {ex.name}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                {ex.equipment}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${levelColors[ex.level] || levelColors.Beginner}`}>
                                                {ex.level}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Chevron */}
                                    <div className="text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0 mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </div>
                                    
                                    {/* Left Accent Bar on Hover */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-indigo-500 rounded-r-md group-hover:h-3/4 transition-all duration-300 ease-out" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
