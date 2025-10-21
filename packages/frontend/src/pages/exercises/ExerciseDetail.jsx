import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ExerciseDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Nếu đã có state (được truyền từ list), không cần fetch
    if (exercise) return;

    let isMounted = true;
    const fetchOne = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fallback: lấy danh sách và tìm theo id (tạm thời, khi chưa có API chi tiết)
        const res = await axios.get('/api/exercises');
        if (res.data?.success) {
          const found = (res.data.data || []).find((e) => String(e.id) === String(id));
          if (isMounted) {
            if (found) setExercise(found);
            else setError('Không tìm thấy bài tập');
          }
        } else {
          if (isMounted) setError('Không thể tải thông tin bài tập');
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Lỗi tải dữ liệu');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOne();
    return () => { isMounted = false; };
  }, [id, exercise]);

  return (
    <div className="max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Quay lại
      </button>

      {loading && (
        <div className="text-gray-600">Đang tải thông tin bài tập...</div>
      )}

      {error && !loading && (
        <div className="text-red-600">{error}</div>
      )}

      {exercise && !loading && !error && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900">{exercise.name}</h1>
          <div className="flex items-center gap-2 mt-3 text-sm">
            {exercise.difficulty && (
              <span className="px-2 py-1 text-gray-700 bg-gray-100 rounded">{exercise.difficulty}</span>
            )}
            {exercise.equipment && (
              <span className="px-2 py-1 text-blue-700 rounded bg-blue-50">{exercise.equipment}</span>
            )}
          </div>

          {exercise.imageUrl && (
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="object-cover w-full h-64 mt-6 rounded"
            />
          )}

          {exercise.description && (
            <p className="mt-6 text-gray-700">{exercise.description}</p>
          )}
        </div>
      )}
    </div>
  );
}

