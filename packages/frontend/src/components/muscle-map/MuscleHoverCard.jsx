export function MuscleHoverCard({ muscleInfo, position }) {

    if (!muscleInfo) return null;

    return (
        <div
            style={{
                position: "fixed",
                left: position.x,
                top: position.y,
                zIndex: 999,
                pointerEvents: "none"
            }}
            className="bg-white dark:bg-zinc-900 shadow-xl border rounded-lg p-3 w-56"
        >

            <div className="font-semibold mb-2 flex items-center gap-2">
                <span>{muscleInfo.icon}</span>
                <span>{muscleInfo.name}</span>
            </div>

            <ul className="text-xs space-y-1">

                {muscleInfo.exercises.map((ex, i) => (
                    <li key={i}>• {ex}</li>
                ))}

            </ul>

        </div>
    );
}