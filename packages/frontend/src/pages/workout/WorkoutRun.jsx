import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderLogin from '../../components/header/HeaderLogin.jsx';
import {
  getCurrentExerciseApi,
  completeCurrentExerciseApi,
  skipCurrentExerciseApi,
  completeWorkoutSessionApi,
} from '../../lib/api.js';

function Badge({ children, tone = 'gray' }) {
  const tones = { gray: 'bg-gray-100 text-gray-700', blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700', amber: 'bg-amber-50 text-amber-700' };
  return <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${tones[tone] || tones.gray}`}>{children}</span>;
}

export default function WorkoutRun() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [isDone, setIsDone] = useState(false);

  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const loadCurrent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCurrentExerciseApi(sessionId);
      if (res?.success) {
        setSession(res.data?.session || null);
        setExercise(res.data?.exercise || null);
        setIsDone(!!res.data?.is_done);
        const preset = Number(res.data?.exercise?.target_rest_seconds);
        setSeconds(Number.isFinite(preset) && preset > 0 ? preset : 60);
        setRunning(false);
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      } else setError({ message: res?.message || 'Không thể tải dữ liệu' });
    } catch (e) {
      setError({ message: e?.response?.data?.message || e?.message || 'Lỗi kết nối' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCurrent(); /* eslint-disable-next-line */ }, [sessionId]);

  useEffect(() => {
    if (!running) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current); timerRef.current = null; setRunning(false); return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const adjust = (delta) => setSeconds((s) => Math.max(0, s + delta));

  const handleComplete = async () => {
    try {
      const res = await completeCurrentExerciseApi(sessionId);
      if (res?.success) await loadCurrent();
      else alert(res?.message || 'Không thể hoàn thành bài');
    } catch (e) { alert(e?.response?.data?.message || e?.message || 'Không thể hoàn thành bài'); }
  };

  const handleSkip = async () => {
    try {
      const res = await skipCurrentExerciseApi(sessionId);
      if (res?.success) await loadCurrent();
      else alert(res?.message || 'Không thể bỏ qua bài');
    } catch (e) { alert(e?.response?.data?.message || e?.message || 'Không thể bỏ qua bài'); }
  };

  const handleEndSession = async () => {
    if (!confirm('Kết thúc buổi tập?')) return;
    try {
      const res = await completeWorkoutSessionApi(sessionId, {});
      if (res?.success) navigate('/dashboard');
      else alert(res?.message || 'Không thể kết thúc buổi');
    } catch (e) { alert(e?.response?.data?.message || e?.message || 'Không thể kết thúc buổi'); }
  };

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="min-h-screen text-gray-900 bg-white">
      <HeaderLogin />
      <main className="max-w-3xl px-4 py-8 mx-auto">
        <button type="button" onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">← Quay lại</button>

        {loading && <div className="p-4 text-sm text-gray-600">Đang tải...</div>}
        {error && !loading && <div className="p-4 mb-4 text-sm text-red-600 border border-red-200 rounded bg-red-50">{error.message}</div>}

        {!loading && session && (
          <div className="space-y-6">
            <div className="p-5 bg-white border rounded-xl">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Kế hoạch: {session.plan_id || ''}</h1>
                <div className="flex gap-2">
                  <Badge tone="blue">Bài hiện tại: {Number(session.current_exercise_index)+1}</Badge>
                </div>
              </div>
            </div>

            {isDone ? (
              <div className="p-6 text-center border border-green-200 bg-green-50 rounded-xl">
                <div className="text-lg font-semibold text-green-700">Đã hoàn thành tất cả bài trong buổi</div>
                <button className="px-4 py-2 mt-4 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700" onClick={handleEndSession}>Hoàn thành buổi</button>
              </div>
            ) : (
              <div className="p-5 bg-white border rounded-xl">
                <div className="flex items-start gap-4">
                  {exercise?.image_url ? (
                    <img src={exercise.image_url} alt={exercise.name} className="object-cover w-32 h-32 rounded" />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">{exercise?.name || 'Bài tập'}</h2>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-3">{exercise?.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exercise?.target_sets && <Badge tone="green">{exercise.target_sets} sets</Badge>}
                      {exercise?.target_reps && <Badge tone="amber">{exercise.target_reps} reps</Badge>}
                      {exercise?.target_rest_seconds != null && <Badge tone="gray">Nghỉ: {exercise.target_rest_seconds}s</Badge>}
                    </div>
                  </div>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-4 p-4 mt-6 border rounded-lg bg-gray-50">
                  <button className="px-3 py-2 text-sm border rounded-lg" onClick={() => adjust(-15)}>-15s</button>
                  <button className="px-3 py-2 text-sm border rounded-lg" onClick={() => adjust(-5)}>-5s</button>
                  <div className="font-mono text-3xl tabular-nums">{mins}:{secs}</div>
                  <button className="px-3 py-2 text-sm border rounded-lg" onClick={() => adjust(5)}>+5s</button>
                  <button className="px-3 py-2 text-sm border rounded-lg" onClick={() => adjust(15)}>+15s</button>
                </div>
                <div className="flex items-center justify-center gap-3 mt-3">
                  {!running ? (
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700" onClick={() => setRunning(true)}>Bắt đầu</button>
                  ) : (
                    <button className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-amber-600 hover:bg-amber-700" onClick={() => setRunning(false)}>Tạm dừng</button>
                  )}
                  <button className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700" onClick={handleComplete}>Hoàn thành</button>
                  <button className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={handleSkip}>Bỏ qua</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

