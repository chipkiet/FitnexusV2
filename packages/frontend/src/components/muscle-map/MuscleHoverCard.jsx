import { cn } from "@/lib/utils";

export function MuscleHoverCard({ muscleInfo, position }) {

    if (!muscleInfo) return null;

    return (
        <div
            style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                zIndex: 999,
                pointerEvents: "none",
            }}
            className={cn(
                "w-52 rounded-xl border bg-popover text-popover-foreground shadow-xl p-4",
                "animate-in fade-in-0 zoom-in-95 duration-150"
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg leading-none">{muscleInfo.icon}</span>
                <span className="font-semibold text-sm leading-tight">{muscleInfo.name}</span>
            </div>

            {/* Divider */}
            <div className="border-t mb-3" />

            {/* Exercises */}
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-2">
                Exercises
            </p>
            <ul className="space-y-1.5">
                {muscleInfo.exercises.map((ex, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {ex}
                    </li>
                ))}
            </ul>
        </div>
    );
}