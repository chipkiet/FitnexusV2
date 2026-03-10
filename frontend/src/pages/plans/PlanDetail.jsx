import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderLogin from "../../components/header/HeaderLogin.jsx";
import {
  getPlanByIdApi,
  reorderPlanExercisesApi,
  updatePlanExerciseApi,
  deletePlanApi,
  deleteExerciseFromPlanApi,
  api,
  listWorkoutSessionsApi,
} from "../../lib/api.js";

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

function EditExerciseModal({ exercise, onClose, onSave }) {
  const [sets, setSets] = useState(exercise?.sets_recommended ?? "");
  const [reps, setReps] = useState(exercise?.reps_recommended ?? "");
  const [rest, setRest] = useState(exercise?.rest_period_seconds ?? "");
  const [weight, setWeight] = useState(exercise?.target_weight_kg ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        sets_recommended: sets !== "" ? parseInt(sets, 10) : null,
        reps_recommended: reps !== "" ? String(reps) : null,
        rest_period_seconds: rest !== "" ? parseInt(rest, 10) : null,
        target_weight_kg: weight !== "" ? parseFloat(weight) : null,
      });
      onClose();
    } catch (e) {
      console.error("Save exercise settings error:", e);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition";
  const labelCls = "block mb-1 text-sm font-semibold text-gray-700";
  const helperCls = "mt-1 text-xs text-gray-400 leading-snug";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md p-6 mx-4 bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-900">Thiết lập Mục tiêu</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {exercise?.exercise?.name || `Bài tập #${exercise?.exercise_id}`}
          </p>
          <p className="mt-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">
            ℹ️ Đây là mục tiêu (Target) — không phải ghi log thực tế
          </p>
        </div>

        <div className="space-y-4">
          {/* Sets + Reps — 2 cột trên cùng hàng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Mục tiêu số Sets</label>
              <input
                type="number"
                min="1"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className={inputCls}
                placeholder="VD: 3"
              />
              <p className={helperCls}>Số hiệp cần thực hiện.</p>
            </div>
            <div>
              <label className={labelCls}>Khoảng Reps mục tiêu</label>
              <input
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className={inputCls}
                placeholder="VD: 8-12"
              />
              <p className={helperCls}>Có thể nhập khoảng, VD "8-12".</p>
            </div>
          </div>

          {/* Target Weight */}
          <div>
            <label className={labelCls}>
              Mức tạ khởi điểm (kg)
              <span className="ml-1 text-xs font-normal text-gray-400">— Tùy chọn</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={inputCls}
              placeholder="VD: 60"
            />
            <p className={helperCls}>
              Gợi ý mức tạ sẽ hiển thị sẵn trong trang ghi log buổi tập.
            </p>
          </div>

          {/* Rest */}
          <div>
            <label className={labelCls}>Thời gian nghỉ giữa hiệp (giây)</label>
            <input
              type="number"
              min="0"
              step="5"
              value={rest}
              onChange={(e) => setRest(e.target.value)}
              className={inputCls}
              placeholder="VD: 90"
            />
            <p className={helperCls}>
              Thời gian nghỉ khuyến nghị sau mỗi set (giây).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {saving ? 'Đang lưu...' : 'Lưu mục tiêu'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResumeRestartModal({ activeSession, onClose, onResume, onRestart }) {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} ngày trước`;
    if (diffHours > 0) return `${diffHours} giờ trước`;
    if (diffMins > 0) return `${diffMins} phút trước`;
    return 'vừa xong';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Bạn có buổi tập đang dở
        </h3>

        <div className="mb-6">
          <p className="mb-3 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{activeSession.plan_name}</span>
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Lần cuối tập:</span>
              <span className="font-medium text-blue-600">
                {getTimeAgo(activeSession.updated_at)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tiến độ:</span>
              <span className="font-medium text-gray-900">
                {activeSession.current_exercise_index + 1} / {activeSession.exercises_count} bài
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className={`font-medium ${activeSession.status === 'paused' ? 'text-amber-600' : 'text-green-600'
                }`}>
                {activeSession.status === 'paused' ? 'Đã tạm dừng' : 'Đang tập'}
              </span>
            </div>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-600">
          Bạn muốn tiếp tục buổi tập này hay bắt đầu lại từ đầu?
        </p>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full px-4 py-3 text-sm font-semibold text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            Tiếp tục buổi tập
          </button>

          <button
            onClick={onRestart}
            className="w-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors border-2 border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Bắt đầu lại từ đầu
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

function ActiveOtherPlanModal({ activeSession, currentPlanName, onClose, onContinueOther, onFinishOtherThenStart }) {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays} ngày trước`;
    if (diffHours > 0) return `${diffHours} giờ trước`;
    if (diffMins > 0) return `${diffMins} phút trước`;
    return 'vừa xong';
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">Bạn đang có buổi tập ở kế hoạch khác</h3>
        <div className="mb-4 text-sm text-gray-600">
          <div>
            Kế hoạch đang dở: <span className="font-medium text-gray-900">{activeSession.plan_name || `#${activeSession.plan_id}`}</span>
          </div>
          <div className="mt-1">Tiến độ: {activeSession.current_exercise_index + 1} / {activeSession.exercises_count} bài • Lần cuối: {getTimeAgo(activeSession.updated_at)}</div>
          <div className="mt-2">Kế hoạch bạn đang mở: <span className="font-medium">{currentPlanName}</span></div>
        </div>
        <div className="space-y-3">
          <button onClick={onContinueOther} className="w-full px-4 py-3 text-sm font-semibold text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700">Tiếp tục buổi đang dở</button>
          <button onClick={onFinishOtherThenStart} className="w-full px-4 py-3 text-sm font-medium text-gray-700 transition-colors border-2 border-gray-300 rounded-lg hover:bg-gray-50">Kết thúc buổi đó và bắt đầu kế hoạch này</button>
          <button onClick={onClose} className="w-full px-4 py-3 text-sm text-gray-500 transition-colors hover:text-gray-700">Để sau</button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({ planName, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 text-xl font-semibold text-red-800">Xác nhận xóa</h3>
        <p className="mb-6 text-sm text-gray-600">
          Bạn có chắc chắn muốn xóa vĩnh viễn kế hoạch "<b>{planName}</b>"? Tất cả bài tập trong kế hoạch này cũng sẽ bị xóa. Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-4">
          <button onClick={onCancel} disabled={isDeleting} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            Hủy
          </button>
          <button onClick={onConfirm} disabled={isDeleting} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
            {isDeleting ? "Đang xóa..." : "Xóa kế hoạch"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteExerciseConfirmationModal({ exerciseName, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 text-xl font-semibold text-red-800">Xác nhận xóa bài tập</h3>
        <p className="mb-6 text-sm text-gray-600">
          Bạn có chắc chắn muốn xóa bài tập "<b>{exerciseName}</b>" khỏi kế hoạch này? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-4">
          <button onClick={onCancel} disabled={isDeleting} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            Hủy
          </button>
          <button onClick={onConfirm} disabled={isDeleting} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60">
            {isDeleting ? "Đang xóa..." : "Xóa bài tập"}
          </button>
        </div>
      </div>
    </div>
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
  const [editingExercise, setEditingExercise] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showOtherPlanModal, setShowOtherPlanModal] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [startingWorkout, setStartingWorkout] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteExerciseModal, setShowDeleteExerciseModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [isDeletingExercise, setIsDeletingExercise] = useState(false);

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
          if (!res.data?.plan) {
            navigate('/plans/new');
            return;
          }
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

    (async () => {
      try {
        const r1 = await listWorkoutSessionsApi({ planId: Number(planId), status: 'active' });
        const r2 = await listWorkoutSessionsApi({ planId: Number(planId), status: 'completed' });
        setActiveSessions(r1?.data?.items || []);
        setCompletedSessions(r2?.data?.items || []);
      } catch { }
    })();

    return () => { alive = false; };
  }, [planId, navigate]);

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
    setError(null);

    try {
      const updates = items.map((item, idx) => ({
        plan_exercise_id: item.plan_exercise_id,
        session_order: idx + 1
      }));

      const res = await reorderPlanExercisesApi(planId, updates);

      if (!res?.success) {
        const reloadRes = await getPlanByIdApi(planId);
        if (reloadRes?.success) {
          setItems(reloadRes.data?.items || []);
        }
        setError({ message: res?.message || "Không thể lưu thứ tự mới" });
      } else {
        setError(null);
      }
    } catch (e) {
      console.error("Reorder error:", e);
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

  const handleEditExercise = async (exercise, data) => {
    try {
      const res = await updatePlanExerciseApi(planId, exercise.plan_exercise_id, data);

      if (res?.success) {
        setItems(prevItems =>
          prevItems.map(item =>
            item.plan_exercise_id === exercise.plan_exercise_id
              ? { ...item, ...data }
              : item
          )
        );
        setError(null);
      } else {
        setError({ message: res?.message || "Không thể cập nhật bài tập" });
      }
    } catch (err) {
      console.error("Update exercise error:", err);
      setError({ message: "Không thể cập nhật bài tập" });
    }
  };

  const handleDeletePlan = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await deletePlanApi(planId);
      if (res?.success) {
        navigate('/plans/manage', { state: { toast: 'Kế hoạch đã được xóa thành công.' } });
      } else {
        throw new Error(res?.message || "Xóa kế hoạch thất bại.");
      }
    } catch (err) {
      setError({ message: err.message || "Đã xảy ra lỗi khi xóa kế hoạch." });
      setIsDeleting(false);
    }
  };

  const handleDeleteExercise = async () => {
    if (!exerciseToDelete) return;
    setIsDeletingExercise(true);
    setError(null);
    try {
      const res = await deleteExerciseFromPlanApi(planId, exerciseToDelete.plan_exercise_id);
      if (res?.success) {
        setItems(prevItems => {
          const updatedItems = prevItems
            .filter(item => item.plan_exercise_id !== exerciseToDelete.plan_exercise_id)
            .map((item, index) => ({ ...item, session_order: index + 1 }));
          return updatedItems;
        });
        setShowDeleteExerciseModal(false);
        setExerciseToDelete(null);
        setError(null);
      } else {
        throw new Error(res?.message || "Xóa bài tập thất bại.");
      }
    } catch (err) {
      console.error('Delete exercise error:', err);
      setError({ message: err.message || "Đã xảy ra lỗi khi xóa bài tập." });
    } finally {
      setIsDeletingExercise(false);
    }
  };

  // ============ WORKOUT START FLOW ============
  const startWorkout = async () => {
    setStartingWorkout(true);
    setError(null);
    try {
      const activeRes = await api.get('/api/workout/active');
      const activeSess = activeRes?.data?.data?.session || null;
      if (!activeSess) {
        await createNewSession();
      } else if (Number(activeSess.plan_id) === Number(planId)) {
        setActiveSession(activeSess);
        setShowResumeModal(true);
      } else {
        setActiveSession(activeSess);
        setShowOtherPlanModal(true);
      }
    } catch (err) {
      console.error("Check active session error:", err);
      setError({ message: "Không thể kiểm tra buổi tập hiện tại" });
    } finally {
      setStartingWorkout(false);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await api.post('/api/workout', {
        plan_id: Number(planId),
        notes: null
      });
      if (res.data.success) {
        navigate(`/workout-run/${res.data.data.session_id}`);
      } else {
        setError({ message: res.data.message || "Không thể tạo buổi tập" });
      }
    } catch (err) {
      console.error("Create session error:", err);
      if (err.response?.status === 409) {
        const sessionData = err.response.data.data;
        setActiveSession(sessionData);
        setShowResumeModal(true);
      } else {
        setError({ message: "Không thể tạo buổi tập" });
      }
    }
  };

  const handleResume = () => {
    setShowResumeModal(false);
    navigate(`/workout-run/${activeSession.session_id}`);
  };

  const handleRestart = async () => {
    setShowResumeModal(false);
    setStartingWorkout(true);
    try {
      if (activeSession?.session_id) {
        try { await api.post(`/api/workout/${activeSession.session_id}/complete`); } catch { }
      }
      await createNewSession();
    } catch (err) {
      console.error('Restart (complete+create) error:', err);
      setError({ message: 'Không thể bắt đầu lại buổi tập' });
    } finally {
      setStartingWorkout(false);
    }
  };

  const handleContinueOther = () => {
    setShowOtherPlanModal(false);
    if (activeSession?.session_id) navigate(`/workout-run/${activeSession.session_id}`);
  };

  const handleFinishOtherThenStart = async () => {
    setShowOtherPlanModal(false);
    setStartingWorkout(true);
    try {
      if (activeSession?.session_id) {
        try { await api.post(`/api/workout/${activeSession.session_id}/complete`); } catch { }
      }
      await createNewSession();
    } catch (e) {
      setError({ message: 'Không thể bắt đầu buổi mới' });
    } finally {
      setStartingWorkout(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-900 bg-white">
      <HeaderLogin />
      <main className="max-w-5xl px-4 py-6 mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Quay lại
        </button>
        {loading && <div className="p-4 text-sm text-gray-600">Đang tải kế hoạch...</div>}
        {error && !loading && (
          <div className="p-4 mb-4 text-sm text-red-600 border border-red-200 rounded bg-red-50">
            {error.message}
          </div>
        )}
        {saving && (
          <div className="p-4 mb-4 text-sm text-blue-600 border border-blue-200 rounded bg-blue-50">
            Đang lưu thứ tự mới...
          </div>
        )}
        {plan && !loading && (
          <div className="space-y-6">
            <div className="p-5 bg-white border rounded-xl shadow-sm">
              <div className="flex items-start justify-between gap-4">
                {/* Plan title + edit hint */}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold text-gray-900">{plan.name || "Kế hoạch tập luyện"}</h1>
                    <button
                      title="Chỉnh sửa tên kế hoạch"
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => navigate(`/plans/${planId}/edit`)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  {plan.description && (
                    <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                  )}
                  <div className="mt-2">
                    {plan.difficulty_level && (
                      <Badge tone="amber">Độ khó: {plan.difficulty_level}</Badge>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      try {
                        const ctx = { plan_id: Number(planId), name: plan?.name || '' };
                        sessionStorage.setItem('current_plan_context', JSON.stringify(ctx));
                      } catch { }
                      navigate('/exercises');
                    }}
                  >
                    + Thêm bài tập
                  </button>

                  {/* Smart CTA: "Tiếp tục tập" if active session exists, else "Bắt đầu tập" */}
                  {activeSessions.length > 0 ? (
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 shadow-sm transition-all"
                      onClick={() => navigate(`/workout-run/${activeSessions[0].session_id}`)}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Tiếp tục tập
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={startWorkout}
                      disabled={startingWorkout || !items.length}
                    >
                      {startingWorkout ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                      {startingWorkout ? 'Đang chuẩn bị...' : 'Bắt đầu tập'}
                    </button>
                  )}

                  {/* Icon-only delete — gray, hover:red */}
                  <button
                    title="Xóa kế hoạch"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
                      className={`flex items-start justify-between gap-3 p-3 border rounded-lg cursor-move transition-all ${draggedIndex === index ? 'opacity-50 border-blue-400' : 'hover:border-gray-400'
                        }`}
                    >
                      <div className="flex items-start flex-1 min-w-0 gap-3">
                        <div className="flex flex-col items-center justify-center pt-1 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded">
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
                            {it.rest_period_seconds !== null && it.rest_period_seconds !== undefined && (
                              <Badge tone="gray">Nghỉ: {it.rest_period_seconds}s</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          className="px-3 py-1.5 text-sm text-blue-400 border border-blue-200 rounded hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingExercise(it);
                          }}
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                          onClick={() => navigate(`/exercises/${it.exercise?.id || it.exercise_id}`)}
                        >
                          Xem chi tiết
                        </button>
                        {/* NEW: Delete exercise button */}
                        <button
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExerciseToDelete(it);
                            setShowDeleteExerciseModal(true);
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* In-progress banner (full-width, amber) — only shown if active sessions exist */}
            {activeSessions.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-amber-900">🏋️ Đang tập dang dở</h3>
                  <span className="text-xs text-amber-600 font-medium">{activeSessions.length} buổi</span>
                </div>
                <div className="space-y-2">
                  {activeSessions.map((s) => (
                    <div
                      key={s.session_id}
                      className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors group"
                      onClick={() => navigate(`/workout-run/${s.session_id}`)}
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          Bắt đầu: {new Date(s.started_at).toLocaleString('vi-VN')}
                        </div>
                        <div className="text-xs text-amber-600 mt-0.5">⏸ Chạm để tiếp tục buổi tập này</div>
                      </div>
                      <span className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        Tiếp tục →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workout history — vertical, white cards */}
            <div className="p-5 bg-white border rounded-xl">
              <h3 className="mb-3 text-base font-semibold text-gray-900">📋 Lịch sử tập luyện</h3>
              {!completedSessions.length ? (
                <div className="flex items-center gap-2 py-6 text-sm text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Chưa có buổi tập nào hoàn thành.
                </div>
              ) : (
                <div className="space-y-2">
                  {completedSessions.map((s) => (
                    <div
                      key={s.session_id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(s.ended_at || s.started_at).toLocaleDateString('vi-VN', {
                            weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">⏱ {formatDuration(s.total_duration_seconds)}</span>
                          <span className="text-xs text-gray-500">
                            <span className="text-green-500 font-semibold">✓</span> {s.completed_exercises} bài
                          </span>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {showResumeModal && activeSession && (
          <ResumeRestartModal
            activeSession={activeSession}
            onClose={() => setShowResumeModal(false)}
            onResume={handleResume}
            onRestart={handleRestart}
          />
        )}
        {editingExercise && (
          <EditExerciseModal
            exercise={editingExercise}
            onClose={() => setEditingExercise(null)}
            onSave={(data) => handleEditExercise(editingExercise, data)}
          />
        )}
        {showOtherPlanModal && activeSession && (
          <ActiveOtherPlanModal
            activeSession={activeSession}
            currentPlanName={plan?.name || `(Kế hoạch ${planId})`}
            onClose={() => setShowOtherPlanModal(false)}
            onContinueOther={handleContinueOther}
            onFinishOtherThenStart={handleFinishOtherThenStart}
          />
        )}
        {showDeleteModal && (
          <DeleteConfirmationModal
            planName={plan?.name}
            onConfirm={handleDeletePlan}
            onCancel={() => setShowDeleteModal(false)}
            isDeleting={isDeleting}
          />
        )}
        {showDeleteExerciseModal && exerciseToDelete && (
          <DeleteExerciseConfirmationModal
            exerciseName={exerciseToDelete.exercise?.name || `#${exerciseToDelete.exercise_id}`}
            onConfirm={handleDeleteExercise}
            onCancel={() => {
              setShowDeleteExerciseModal(false);
              setExerciseToDelete(null);
            }}
            isDeleting={isDeletingExercise}
          />
        )}
      </main>
    </div>
  );
}

function formatDuration(sec = 0) {
  const s = Number(sec) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m ${r}s`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
}
