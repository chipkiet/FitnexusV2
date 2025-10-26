import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import { getPlanByIdApi, reorderPlanExercisesApi } from "../../lib/api.js";

function Badge({ children, tone = "gray" }) {
    const tones = {
        gray: "bg-gray-100 text-gray-700",
        blue: "bg-blue-50 text-blue-700",
        green: "bg-green-50 text-green-700",
        amber: "bg-amber-50 text-amber-700",
        purple: "bg-purple-50 text-purple-700",
    };
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${tones[tone] || tones.gray}`}>
      {children}
    </span>
    );
}

export default function PlanDetail() {
    const navigate = useNavigate();
    const { planId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [plan, setPlan] = useState(null);
    const [items, setItems] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let alive = true;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await getPlanByIdApi(planId);
                if (!alive) return;
                if (res?.success) {
                    setPlan(res.data?.plan || null);
                    setItems(res.data?.items || []);
                } else {
                    setError({ message: res?.message || "Không thể tải kế hoạch" });
                }
            } catch (e) {
                if (alive) setError({ message: e?.message || "Lỗi kết nối" });
            } finally {
                if (alive) setLoading(false);
            }
        }
        load();
        return () => { alive = false; };
    }, [planId]);

    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newItems = [...items];
        const draggedItem = newItems[draggedIndex];
        newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);

        setItems(newItems);
        setDraggedIndex(index);
    };

    const handleDragEnd = async () => {
        if (draggedIndex === null) return;

        setSaving(true);
        setError(null); // Clear previous errors

        try {
            // Create update payload with new session_order values
            const updates = items.map((item, idx) => ({
                plan_exercise_id: item.plan_exercise_id,
                session_order: idx + 1
            }));

            const res = await reorderPlanExercisesApi(planId, updates);

            if (!res?.success) {
                // Revert on failure - reload from server
                const reloadRes = await getPlanByIdApi(planId);
                if (reloadRes?.success) {
                    setItems(reloadRes.data?.items || []);
                }
                setError({ message: res?.message || "Không thể lưu thứ tự mới" });
            } else {
                // Success - clear any previous errors
                setError(null);
            }
        } catch (e) {
            console.error("Reorder error:", e);
            // Reload on error
            const reloadRes = await getPlanByIdApi(planId);
            if (reloadRes?.success) {
                setItems(reloadRes.data?.items || []);
            }
            setError({ message: "Không thể lưu thứ tự mới" });
        } finally {
            setDraggedIndex(null);
            setSaving(false);
        }
    };

    const startWorkout = () => {
        alert("Bắt đầu buổi theo kế hoạch (sẽ kết nối BE ở bước tiếp theo)");
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <HeaderLogin />
            <main className="mx-auto max-w-5xl px-4 py-6">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-4 text-blue-600 hover:underline"
                >
                    ← Quay lại
                </button>

                {loading && <div className="p-4 text-sm text-gray-600">Đang tải kế hoạch...</div>}
                {error && !loading && (
                    <div className="p-4 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                        {error.message}
                    </div>
                )}
                {saving && (
                    <div className="p-4 mb-4 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded">
                        Đang lưu thứ tự mới...
                    </div>
                )}

                {plan && !loading && (
                    <div className="space-y-6">
                        <div className="p-5 bg-white border rounded-xl">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900">{plan.name || "(Không có tên)"}</h1>
                                    {plan.description && (
                                        <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                                    )}
                                    <div className="mt-2">
                                        {plan.difficulty_level && (
                                            <Badge tone="amber">Độ khó: {plan.difficulty_level}</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        onClick={() => {
                                            try {
                                                const ctx = {
                                                    plan_id: Number(planId),
                                                    name: plan?.name || '',
                                                };
                                                sessionStorage.setItem('current_plan_context', JSON.stringify(ctx));
                                            } catch {}
                                            navigate('/exercises');
                                        }}
                                    >
                                        Thêm bài tập từ Thư viện
                                    </button>
                                    <button
                                        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                        onClick={startWorkout}
                                    >
                                        Bắt đầu buổi
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-white border rounded-xl">
                            <h2 className="mb-3 text-lg font-semibold">Bài tập trong kế hoạch</h2>
                            <p className="mb-4 text-sm text-gray-500">Kéo thả để sắp xếp lại thứ tự bài tập</p>

                            {!items.length ? (
                                <div className="text-sm text-gray-600">Chưa có bài tập nào. Hãy thêm từ Thư viện.</div>
                            ) : (
                                <div className="space-y-3">
                                    {items.map((it, index) => (
                                        <div
                                            key={it.plan_exercise_id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`flex items-start justify-between gap-3 p-3 border rounded-lg cursor-move transition-all ${
                                                draggedIndex === index ? 'opacity-50 border-blue-400' : 'hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                                {/* Drag Handle */}
                                                <div className="flex flex-col items-center justify-center text-gray-400 pt-1">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                    </svg>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                                                        <div className="text-sm font-medium text-gray-900 truncate">
                                                            {it.exercise?.name || `#${it.exercise_id}`}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {it.exercise?.difficulty && (
                                                            <Badge tone="amber">{it.exercise.difficulty}</Badge>
                                                        )}
                                                        {it.exercise?.equipment && (
                                                            <Badge tone="blue">{it.exercise.equipment}</Badge>
                                                        )}
                                                        {it.sets_recommended && (
                                                            <Badge tone="green">{it.sets_recommended} sets</Badge>
                                                        )}
                                                        {it.reps_recommended && (
                                                            <Badge tone="purple">{it.reps_recommended} reps</Badge>
                                                        )}
                                                        {it.rest_period_seconds && (
                                                            <Badge tone="gray">Nghỉ: {it.rest_period_seconds}s</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                                                    onClick={() => navigate(`/exercises/${it.exercise?.id || it.exercise_id}`)}
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}