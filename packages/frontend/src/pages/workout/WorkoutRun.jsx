import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderLogin from '../../components/header/HeaderLogin.jsx';
import {
  getSessionDetailApi,
  logWorkoutSetApi,
  completeWorkoutSessionApi,
} from '../../lib/api.js';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Plus,
  Dumbbell,
  Trophy,
  Loader2,
  AlertCircle,
  ClipboardList,
  Timer,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function rpeLabel(rpe) {
  const n = parseFloat(rpe);
  if (n <= 5) return 'Dễ';
  if (n <= 7) return 'Trung bình';
  if (n <= 9) return 'Khó';
  return 'Tối đa';
}

function rpeColor(rpe) {
  const n = parseFloat(rpe);
  if (n <= 5) return 'text-green-500';
  if (n <= 7) return 'text-yellow-500';
  if (n <= 9) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Build the initial set array for an exercise when loading from API.
 * - If sets exist in DB (logged) → use them
 * - If target_sets defined and no DB sets → generate empty placeholder rows
 */
function buildInitialSets(dbSets, targetSets, targetWeightKg, targetReps) {
  if (dbSets && dbSets.length > 0) {
    // Restore DB-logged sets with proper types
    return dbSets.map(s => ({
      ...s,
      actual_weight_kg: s.actual_weight_kg ?? '',
      actual_reps: s.actual_reps ?? '',
      rpe: s.rpe ?? '',
      _local: false,
    }));
  }
  // Auto-generate empty rows based on target_sets
  const count = targetSets && targetSets > 0 ? targetSets : 0;
  return Array.from({ length: count }, (_, i) => ({
    set_index: i + 1,
    actual_weight_kg: '',
    actual_reps: '',
    rpe: '',
    completed_at: null,
    _local: true,
    // Placeholder hint data — NOT saved automatically
    _ph_weight: targetWeightKg || null,
    _ph_reps: targetReps || null,
  }));
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
const initialState = {
  session: null,
  exercises: [],
  activeIdx: 0,
  loading: true,
  error: null,
  submitting: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADED':
      return { ...state, loading: false, session: action.session, exercises: action.exercises };
    case 'ERROR':
      return { ...state, loading: false, error: action.message };
    case 'SET_ACTIVE':
      return { ...state, activeIdx: action.idx };
    case 'ADD_SET': {
      const exercises = state.exercises.map((ex, i) => {
        if (i !== state.activeIdx) return ex;
        const nextIdx = (ex.sets.length > 0 ? Math.max(...ex.sets.map(s => s.set_index)) : 0) + 1;
        return {
          ...ex,
          sets: [...ex.sets, {
            set_index: nextIdx,
            actual_weight_kg: '',
            actual_reps: '',
            rpe: '',
            completed_at: null,
            _local: true,
            _ph_weight: ex.target_weight_kg || null,
            _ph_reps: ex.target_reps || null,
          }],
        };
      });
      return { ...state, exercises };
    }
    case 'UPDATE_SET_FIELD': {
      const { setIndex, field, value } = action;
      const exercises = state.exercises.map((ex, i) => {
        if (i !== state.activeIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s => s.set_index === setIndex ? { ...s, [field]: value } : s),
        };
      });
      return { ...state, exercises };
    }
    case 'SET_COMPLETED': {
      const { exIdx, setIndex, savedSet } = action;
      const exercises = state.exercises.map((ex, i) => {
        if (i !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s =>
            s.set_index === setIndex ? { ...s, ...savedSet, _local: false, _ph_weight: null, _ph_reps: null } : s
          ),
        };
      });
      return { ...state, exercises };
    }
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.value };
    default:
      return state;
  }
}

// ─── Rest Timer Component ──────────────────────────────────────────────────────
function RestTimer({ seconds, onDismiss }) {
  const [remaining, setRemaining] = useState(seconds);
  const ref = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [seconds]);

  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-center gap-2 p-4 bg-white border border-indigo-200 rounded-2xl shadow-xl min-w-[160px]">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wide">
          <Timer className="w-3.5 h-3.5" />
          Thời gian nghỉ
        </div>
        {/* Circular progress */}
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e0e7ff" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={remaining === 0 ? '#22c55e' : '#4f46e5'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${remaining === 0 ? 'text-green-500' : 'text-indigo-700'}`}>
              {remaining === 0 ? '✓' : `${mins}:${String(secs).padStart(2, '0')}`}
            </span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          {remaining === 0 ? 'Bắt đầu set tiếp' : 'Bỏ qua'}
        </button>
      </div>
    </div>
  );
}

// ─── Exercise Sidebar ──────────────────────────────────────────────────────────
function ExerciseSidebar({ exercises, activeIdx, dispatch }) {
  return (
    <div className="flex flex-col w-full gap-1 lg:w-64 shrink-0">
      <p className="mb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">Bài tập</p>
      {exercises.map((ex, i) => {
        const total = Math.max(ex.sets.length, ex.target_sets || 0);
        const done = ex.sets.filter(s => s.completed_at).length;
        const allDone = total > 0 && done === total;
        return (
          <button
            key={ex.session_exercise_id}
            onClick={() => dispatch({ type: 'SET_ACTIVE', idx: i })}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${i === activeIdx
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${allDone ? 'bg-green-500 text-white' : i === activeIdx ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              {allDone ? '✓' : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{ex.exercise?.name || `Bài ${i + 1}`}</div>
              <div className={`text-xs mt-0.5 ${i === activeIdx ? 'text-indigo-200' : 'text-gray-400'}`}>
                {done}/{total} sets
              </div>
            </div>
            {i === activeIdx && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Set Table ──────────────────────────────────────────────────────────────────
function SetTable({ exercise, exIdx, sessionId, dispatch, onSetCompleted }) {
  const [saving, setSaving] = useState({});

  const handleComplete = useCallback(async (set) => {
    if (saving[set.set_index] || set.completed_at) return;
    setSaving(p => ({ ...p, [set.set_index]: true }));
    try {
      // Use actual typed value OR the placeholder hint (if user didn't type anything)
      const weightVal = set.actual_weight_kg !== '' ? set.actual_weight_kg : set._ph_weight;
      const repsRaw = set.actual_reps !== '' ? set.actual_reps : (set._ph_reps ? String(set._ph_reps).split('-')[0] : null);

      const res = await logWorkoutSetApi(sessionId, exercise.session_exercise_id, {
        set_index: set.set_index,
        actual_reps: repsRaw ? parseInt(repsRaw, 10) : null,
        actual_weight_kg: weightVal ? parseFloat(weightVal) : null,
        rpe: set.rpe !== '' ? set.rpe : null,
        notes: set.notes || null,
      });
      if (res?.success) {
        dispatch({ type: 'SET_COMPLETED', exIdx, setIndex: set.set_index, savedSet: res.data });
        // Trigger rest timer
        if (exercise.target_rest_seconds && exercise.target_rest_seconds > 0) {
          onSetCompleted(exercise.target_rest_seconds);
        }
      }
    } catch (e) {
      console.error('logSet error:', e);
    } finally {
      setSaving(p => ({ ...p, [set.set_index]: false }));
    }
  }, [sessionId, exercise, exIdx, dispatch, saving, onSetCompleted]);

  return (
    <div className="overflow-hidden border border-gray-200 rounded-xl">
      {/* Header */}
      <div className="grid items-center grid-cols-12 gap-2 px-4 py-2.5 text-xs font-semibold tracking-wide text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
        <div className="col-span-1">Set</div>
        <div className="col-span-3">Mục tiêu</div>
        <div className="col-span-2">Tạ (kg)</div>
        <div className="col-span-2">Reps</div>
        <div className="col-span-2">RPE</div>
        <div className="col-span-2 text-center">✓</div>
      </div>

      {exercise.sets.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
          <ClipboardList className="w-8 h-8" />
          <p className="text-sm">Nhấn "+ Thêm Set" để bắt đầu ghi log</p>
        </div>
      )}

      {exercise.sets.map((set) => {
        const done = !!set.completed_at;
        const isSaving = saving[set.set_index];
        // Build placeholder from _ph_ target hints
        const phWeight = set._ph_weight ? String(set._ph_weight) : undefined;
        const phReps = set._ph_reps ? String(set._ph_reps) : undefined;

        return (
          <div
            key={set.set_index}
            className={`grid items-center grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 last:border-0 transition-colors ${done ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
              }`}
          >
            {/* Set # */}
            <div className="col-span-1">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                {set.set_index}
              </span>
            </div>

            {/* Target column */}
            <div className="col-span-3 text-xs text-gray-400 leading-tight">
              {exercise.target_reps && <div>Reps: {exercise.target_reps}</div>}
              {exercise.target_weight_kg && <div>Tạ: {exercise.target_weight_kg}kg</div>}
              {!exercise.target_reps && !exercise.target_weight_kg && '—'}
            </div>

            {/* Weight input */}
            <div className="col-span-2">
              {done ? (
                <span className="text-sm font-semibold text-gray-800">
                  {set.actual_weight_kg != null ? `${set.actual_weight_kg}` : '—'}
                </span>
              ) : (
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.actual_weight_kg}
                  onChange={e => dispatch({ type: 'UPDATE_SET_FIELD', setIndex: set.set_index, field: 'actual_weight_kg', value: e.target.value })}
                  placeholder={phWeight}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-indigo-300"
                />
              )}
            </div>

            {/* Reps input */}
            <div className="col-span-2">
              {done ? (
                <span className="text-sm font-semibold text-gray-800">
                  {set.actual_reps != null ? set.actual_reps : '—'}
                </span>
              ) : (
                <input
                  type="number"
                  min="0"
                  value={set.actual_reps}
                  onChange={e => dispatch({ type: 'UPDATE_SET_FIELD', setIndex: set.set_index, field: 'actual_reps', value: e.target.value })}
                  placeholder={phReps ? phReps.split('-')[0] : undefined}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-indigo-300"
                />
              )}
            </div>

            {/* RPE input */}
            <div className="col-span-2">
              {done ? (
                <span className={`text-sm font-semibold ${set.rpe ? rpeColor(set.rpe) : 'text-gray-400'}`}>
                  {set.rpe != null ? `${set.rpe}` : '—'}
                </span>
              ) : (
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  placeholder="1-10"
                  value={set.rpe}
                  onChange={e => dispatch({ type: 'UPDATE_SET_FIELD', setIndex: set.set_index, field: 'rpe', value: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              )}
            </div>

            {/* Complete button */}
            <div className="flex justify-center col-span-2">
              {done ? (
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              ) : (
                <button
                  onClick={() => handleComplete(set)}
                  disabled={isSaving}
                  title="Hoàn thành set này"
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-indigo-100 text-gray-300 hover:text-indigo-600 disabled:opacity-50 transition-all"
                >
                  {isSaving
                    ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    : <Circle className="w-7 h-7" />
                  }
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function WorkoutRun() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { session, exercises, activeIdx, loading, error, submitting } = state;
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  // Rest timer state
  const [restTimer, setRestTimer] = useState(null); // null | number (seconds)

  // Load session on mount
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await getSessionDetailApi(sessionId);
        if (!alive) return;
        if (res?.success) {
          const rawExercises = (res.data?.exercises || []).map(ex => ({
            ...ex,
            sets: buildInitialSets(
              ex.sets,
              ex.target_sets,
              ex.target_weight_kg,
              ex.target_reps
            ),
          }));
          dispatch({ type: 'LOADED', session: res.data.session, exercises: rawExercises });
        } else {
          dispatch({ type: 'ERROR', message: res?.message || 'Không thể tải buổi tập' });
        }
      } catch (e) {
        if (alive) dispatch({ type: 'ERROR', message: e?.message || 'Lỗi kết nối' });
      }
    }
    load();
    return () => { alive = false; };
  }, [sessionId]);

  const handleSetCompleted = useCallback((restSeconds) => {
    setRestTimer(restSeconds);
  }, []);

  const handleEndSession = async () => {
    dispatch({ type: 'SET_SUBMITTING', value: true });
    try {
      const res = await completeWorkoutSessionApi(sessionId, {});
      if (res?.success) {
        navigate('/plans/select');
      } else {
        alert(res?.message || 'Không thể kết thúc buổi tập');
      }
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || 'Không thể kết thúc buổi tập');
    } finally {
      dispatch({ type: 'SET_SUBMITTING', value: false });
      setShowEndConfirm(false);
    }
  };

  const activeEx = exercises[activeIdx] || null;
  const totalSets = exercises.reduce((acc, ex) => acc + Math.max(ex.sets.length, ex.target_sets || 0), 0);
  const doneSets = exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed_at).length, 0);
  const progressPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <HeaderLogin />

      <main className="px-4 py-6 mx-auto max-w-7xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {session?.plan_name || `Buổi tập #${sessionId}`}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {doneSets}/{totalSets} sets hoàn thành
              {totalSets > 0 && (
                <span className="ml-2 font-semibold text-indigo-600">{progressPct}%</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowEndConfirm(true)}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-60"
          >
            <Trophy className="w-4 h-4" />
            Kết thúc buổi tập
          </button>
        </div>

        {/* Progress bar */}
        {totalSets > 0 && (
          <div className="w-full h-2 mb-6 overflow-hidden bg-gray-200 rounded-full">
            <div
              className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-gray-500">Đang tải buổi tập...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main layout */}
        {!loading && !error && exercises.length > 0 && (
          <div className="flex flex-col gap-6 lg:flex-row">
            <ExerciseSidebar exercises={exercises} activeIdx={activeIdx} dispatch={dispatch} />

            {activeEx && (
              <div className="flex-1 min-w-0">
                {/* Exercise header */}
                <div className="flex items-start gap-4 p-5 mb-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  {activeEx.exercise?.image_url ? (
                    <img
                      src={activeEx.exercise.image_url}
                      alt={activeEx.exercise.name}
                      className="object-cover w-20 h-20 rounded-xl flex-shrink-0 bg-gray-100"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-indigo-50 flex-shrink-0">
                      <Dumbbell className="w-9 h-9 text-indigo-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900">
                      {activeEx.exercise?.name || `Bài tập ${activeIdx + 1}`}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {activeEx.target_sets && (
                        <span className="px-2 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700">
                          {activeEx.target_sets} sets × {activeEx.target_reps || '?'} reps
                          {activeEx.target_weight_kg ? ` @ ${activeEx.target_weight_kg}kg` : ''}
                        </span>
                      )}
                      {activeEx.target_rest_seconds && (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700">
                          <Timer className="w-3 h-3" />
                          Nghỉ {activeEx.target_rest_seconds}s
                        </span>
                      )}
                      {activeEx.exercise?.difficulty_level && (
                        <span className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 capitalize">
                          {activeEx.exercise.difficulty_level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Set table */}
                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">
                      Ghi log sets
                      <span className="ml-2 text-sm font-normal text-gray-400">
                        ({activeEx.sets.filter(s => s.completed_at).length}/{Math.max(activeEx.sets.length, activeEx.target_sets || 0)} hoàn thành)
                      </span>
                    </h3>
                    <button
                      onClick={() => dispatch({ type: 'ADD_SET' })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm Set
                    </button>
                  </div>

                  {activeEx.target_weight_kg && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-indigo-50 rounded-lg text-xs text-indigo-600">
                      <span>💡</span>
                      <span>Ô mờ = gợi ý mức tạ/reps từ mục tiêu. Nhấn ✓ để xác nhận set.</span>
                    </div>
                  )}

                  <SetTable
                    exercise={activeEx}
                    exIdx={activeIdx}
                    sessionId={sessionId}
                    dispatch={dispatch}
                    onSetCompleted={handleSetCompleted}
                  />

                  {/* RPE Guide */}
                  <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">RPE:</span>
                    {[['1-5', 'Dễ', 'text-green-500'], ['6-7', 'Trung bình', 'text-yellow-500'], ['8-9', 'Khó', 'text-orange-500'], ['10', 'Tối đa', 'text-red-500']].map(([range, label, color]) => (
                      <span key={range} className={`text-xs ${color}`}>{range} = {label}</span>
                    ))}
                  </div>
                </div>

                {/* Navigate exercises */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => dispatch({ type: 'SET_ACTIVE', idx: Math.max(0, activeIdx - 1) })}
                    disabled={activeIdx === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    ← Bài trước
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'SET_ACTIVE', idx: Math.min(exercises.length - 1, activeIdx + 1) })}
                    disabled={activeIdx === exercises.length - 1}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Bài tiếp →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && exercises.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-gray-400">
            <Dumbbell className="w-16 h-16" />
            <p className="text-lg font-medium">Buổi tập không có bài tập nào</p>
            <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 hover:underline">← Quay lại</button>
          </div>
        )}
      </main>

      {/* Rest Timer overlay */}
      {restTimer !== null && (
        <RestTimer
          seconds={restTimer}
          onDismiss={() => setRestTimer(null)}
        />
      )}

      {/* End Session Confirm Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowEndConfirm(false)}>
          <div className="w-full max-w-sm p-6 mx-4 bg-white shadow-2xl rounded-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-indigo-100 rounded-full">
              <Trophy className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-center text-gray-900">Kết thúc buổi tập?</h3>
            <p className="mb-6 text-sm text-center text-gray-500">
              Tất cả sets đã tick ✓ sẽ được lưu lại.<br />
              Sets chưa tick sẽ không được tính.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Tiếp tục tập
              </button>
              <button
                onClick={handleEndSession}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Kết thúc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
