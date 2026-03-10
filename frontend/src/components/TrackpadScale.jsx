import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, RotateCcw, Timer, Activity } from 'lucide-react';
import { useTrackpadWeight } from '@/hooks/useTrackpadWeight';

export default function TrackpadScale({ onWeightLock }) {
    const {
        weight,
        rawWeight,
        isStable,
        isLocked,
        lockedWeight,
        setTare,
        resetLock,
        error
    } = useTrackpadWeight('http://localhost:9999');

    const lastNotifiedWeightRef = useRef(null);

    // Notify parent when weight is locked
    useEffect(() => {
        if (isLocked && onWeightLock && lockedWeight !== null && lockedWeight !== lastNotifiedWeightRef.current) {
            onWeightLock(lockedWeight);
            lastNotifiedWeightRef.current = lockedWeight;
        }
        if (!isLocked) {
            lastNotifiedWeightRef.current = null;
        }
    }, [isLocked, lockedWeight, onWeightLock]);

    const handleTare = () => {
        setTare();
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 min-h-[400px]">
            <Card className="w-full max-w-sm p-8 shadow-2xl bg-white border-slate-200 transition-all duration-300">

                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                        <Activity className={`transition-colors ${isStable ? 'text-green-500' : 'text-slate-300'}`} size={20} />
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                            Smart Scale
                        </h2>
                    </div>
                    {isLocked && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-in fade-in zoom-in">
                            <Lock size={14} /> LOCKED
                        </div>
                    )}
                </div>

                {/* Main Weight Display */}
                <div className={`relative flex flex-col items-center justify-center rounded-2xl py-12 mb-8 transition-all duration-500 
                    ${isLocked ? 'bg-green-50 ring-2 ring-green-200 shadow-inner' :
                        isStable ? 'bg-blue-50 ring-1 ring-blue-100' :
                            'bg-slate-100'}`}>

                    <span className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-4">
                        {isLocked ? 'Stabilized Weight' : 'Live Reading'}
                    </span>

                    <div className={`text-7xl font-mono font-black flex items-baseline transition-colors duration-300 
                        ${isLocked ? 'text-green-600' :
                            isStable ? 'text-blue-600' :
                                'text-slate-900'}`}>
                        {weight.toFixed(1)}
                        <span className="text-3xl ml-2 text-slate-300 font-medium">g</span>
                    </div>

                    {!isLocked && isStable && (
                        <div className="absolute bottom-4 flex items-center gap-2 text-blue-500 font-bold text-xs animate-pulse">
                            <Timer size={14} />
                            <span>READY TO LOCK</span>
                        </div>
                    )}
                </div>

                {/* Debug / Signal Info */}
                <div className="grid grid-cols-2 gap-4 mb-8 px-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-0.5">
                            Raw Signal
                        </span>
                        <span className="text-lg font-mono font-bold text-slate-500">
                            {rawWeight.toFixed(1)}g
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-0.5">
                            Status
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isStable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {isStable ? 'STABLE' : 'UNSTABLE'}
                        </span>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="w-full bg-red-50 text-red-600 text-[10px] font-bold p-3 rounded-lg mb-6 text-center border border-red-100 shadow-sm animate-shake">
                        ⚠ {error}. Ensure scale agent is running on port 9999.
                    </div>
                )}

                {/* Primary Actions */}
                <div className="flex gap-3 mt-4">
                    {!isLocked ? (
                        <>
                            <Button
                                onClick={handleTare}
                                className="flex-1 h-14 text-sm font-black bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all border-b-4 border-slate-400 active:border-b-0 active:translate-y-1"
                            >
                                ZERO / TARE
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleTare}
                                className="w-14 h-14 p-0 bg-white hover:bg-slate-50 rounded-xl border-2 border-slate-200 flex items-center justify-center transition-all"
                            >
                                <RotateCcw size={20} className="text-slate-400" />
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={resetLock}
                            className="flex-1 h-14 text-sm font-black bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all border-b-4 border-blue-300 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={20} /> UNLOCK / CÂN LẠI
                        </Button>
                    )}
                </div>

            </Card>

            <p className="mt-8 text-slate-400 text-[10px] font-medium tracking-tighter uppercase">
                Digital Scale Processing Pipeline Active • 100Hz Sampling
            </p>
        </div>
    );
}

