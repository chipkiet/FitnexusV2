import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/auth.context.jsx";
import { getMyPlansApi, createPlanApi, addExerciseToPlanApi } from "../../lib/api.js";

export default function PlanPicker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const exerciseId = useMemo(() => {
    const v = parseInt(searchParams.get("exerciseId"), 10);
    return Number.isFinite(v) && v > 0 ? v : null;
  }, [searchParams]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Quick create form
  const [qName, setQName] = useState(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `Kế hoạch luyện tập - ${dd}/${mm}/${yyyy}`;
  });
  const [qLevel, setQLevel] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyPlansApi({ limit: 100, offset: 0 });
      const list = res?.data?.items ?? res?.data ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      // Nếu BE chưa có endpoint list, im lặng và để người dùng tạo mới
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddToSelected = async () => {
    if (!exerciseId || !selectedPlanId) return;
    setSaving(true);
    setError(null);
    try {
      await addExerciseToPlanApi({
        planId: selectedPlanId,
        exercise_id: exerciseId,
        sets_recommended: 3,
        reps_recommended: "8-12",
        rest_period_seconds: 60,
      });
      navigate("/exercises", { replace: true });
    } catch (e) {
      setError({ message: e?.response?.data?.message || e?.message || "Không thể thêm vào plan" });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await createPlanApi({ name: qName, difficulty_level: qLevel || undefined, is_public: false });
      const plan = res?.data;
      if (plan?.plan_id) {
        setSelectedPlanId(plan.plan_id);
        // Auto add if exercise is provided
        if (exerciseId) {
          await addExerciseToPlanApi({
            planId: plan.plan_id,
            exercise_id: exerciseId,
            sets_recommended: 3,
            reps_recommended: "8-12",
            rest_period_seconds: 60,
          });
        }
        navigate("/exercises", { replace: true });
      }
    } catch (e) {
      setError({ message: e?.response?.data?.message || e?.message || "Không thể tạo plan" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl px-4 py-10 mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Chọn kế hoạch để thêm bài tập</h1>
        {exerciseId ? (
          <div className="mb-4 text-sm text-gray-600">Bài tập chọn: ID <b>{exerciseId}</b></div>
        ) : (
          <div className="mb-4 text-sm text-gray-600">Không có bài tập được chọn. Hãy quay lại Thư viện để chọn.</div>
        )}

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 border border-red-200 rounded bg-red-50">{error.message}</div>
        )}

        {/* My plans */}
        <div className="p-5 mb-6 bg-white border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Kế hoạch của tôi</h2>
            <button
              type="button"
              onClick={load}
              className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Tải lại
            </button>
          </div>
          {loading ? (
            <div className="text-sm text-gray-600">Đang tải danh sách plan...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa có plan nào. Hãy tạo nhanh bên dưới.</div>
          ) : (
            <div className="space-y-2">
              {items.map((p) => (
                <label key={p.plan_id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="picked_plan"
                    value={p.plan_id}
                    checked={selectedPlanId === p.plan_id}
                    onChange={() => setSelectedPlanId(p.plan_id)}
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    {p.difficulty_level && (
                      <div className="text-xs text-gray-500">Độ khó: {p.difficulty_level}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              disabled={!selectedPlanId || !exerciseId || saving}
              onClick={handleAddToSelected}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              Thêm vào plan đã chọn
            </button>
            <button
              type="button"
              onClick={() => navigate('/exercises')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Trở lại Thư viện
            </button>
          </div>
        </div>

        {/* Quick create */}
        <div className="p-5 bg-white border rounded-xl">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Tạo plan nhanh</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Tên kế hoạch</label>
              <input
                value={qName}
                onChange={(e) => setQName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Cấp độ</label>
              <select
                value={qLevel}
                onChange={(e) => setQLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Không chọn</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              disabled={creating}
              onClick={handleQuickCreate}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              {creating ? "Đang tạo..." : "Tạo và thêm bài tập"}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Về Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
