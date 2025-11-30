import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  favoriteExercise,
  unfavoriteExercise,
  getExerciseFavoriteStatus,
} from "../../lib/api.js";
import { Heart } from "lucide-react";
import { useAuth } from "../../context/auth.context.jsx";

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs ${
        tones[tone] || tones.gray
      }`}
    >
      {children}
    </span>
  );
}

export default function ExerciseDetail() {
  const { id: idOrSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [exerciseRaw, setExerciseRaw] = useState(location.state || null);
  const [related, setRelated] = useState([]);
  const [muscles, setMuscles] = useState(null);
  const [musclesLoading, setMusclesLoading] = useState(false);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState(null);
  const [mainMedia, setMainMedia] = useState(null);
  const [favorited, setFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Scroll top
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {}
  }, [idOrSlug]);

  // --- 1. FETCH DETAIL (Logic Duy Nhất) ---
  useEffect(() => {
    let alive = true;

    async function fetchDetail() {
      // Logic hiển thị loading
      if (
        !exerciseRaw ||
        (String(exerciseRaw.slug) !== idOrSlug &&
          String(exerciseRaw.exercise_id) !== idOrSlug)
      ) {
        setLoading(true);
      }
      // Reset lỗi trước khi gọi
      setError(null);

      try {
        console.log("Fetching detail for:", idOrSlug);
        // Thêm timestamp để tránh cache 304
        const res = await axios.get(
          `/api/exercises/detail/${idOrSlug}?t=${Date.now()}`
        );
        console.log("API Response:", res.data);

        if (alive && res.data?.success) {
          setExerciseRaw(res.data.data);
          // Quan trọng: Đảm bảo xóa lỗi nếu có
          setError(null);
        } else {
          setError("Không tìm thấy bài tập");
        }
      } catch (err) {
        if (alive) {
          console.error(err);
          setError("Lỗi tải dữ liệu bài tập");
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchDetail();
    return () => {
      alive = false;
    };
  }, [idOrSlug]);

  // --- 2. MEMO DATA ---
  const exercise = useMemo(() => {
    if (!exerciseRaw) return null;
    const e = exerciseRaw;
    return {
      exercise_id: e.exercise_id ?? e.id,
      name: e.name,
      name_en: e.name_en,
      slug: e.slug,
      description: e.description,
      difficulty: e.difficulty_level ?? e.difficulty,
      equipment: e.equipment_needed ?? e.equipment,
      type: e.exercise_type ?? e.type,
      thumb: e.thumbnail_url ?? e.imageUrl,
      gif: e.gif_demo_url ?? e.gifUrl,
      primary_video_url: e.primary_video_url,
      primaryMuscles: e.primaryMuscles || [],
      secondaryMuscles: e.secondaryMuscles || [],
      instructions: e.instructions || [],
    };
  }, [exerciseRaw]);

  // --- 3. FETCH EXTRA ---
  useEffect(() => {
    if (!exercise?.exercise_id) return;
    let alive = true;

    // Favorite Status
    getExerciseFavoriteStatus(exercise.exercise_id)
      .then((res) => {
        if (alive && res.data) {
          setFavorited(!!res.data.favorited);
          setFavoriteCount(Number(res.data.favorite_count || 0));
        }
      })
      .catch(() => {});

    // Related
    axios
      .get(`/api/exercises/id/${exercise.exercise_id}/related`, {
        params: { limit: 16 },
      })
      .then((res) => {
        if (alive && res.data?.success) setRelated(res.data.data || []);
      })
      .catch(() => {});

    // Muscles Chart
    (async () => {
      try {
        setMusclesLoading(true);
        const res = await axios.get(
          `/api/exercises/id/${exercise.exercise_id}/muscles`
        );
        if (alive && res?.data?.success) setMuscles(res.data.data || null);
      } catch {
      } finally {
        if (alive) setMusclesLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [exercise?.exercise_id]);

  // --- 4. MEDIA EFFECT ---
  useEffect(() => {
    if (!exercise) return;
    setMainMedia(exercise.gif || exercise.thumb || null);
  }, [exercise]);

  // Handlers
  const handleAddToPlan = () => {
    if (!exercise?.exercise_id) return;
    const picker = `/plans/select?exerciseId=${encodeURIComponent(
      exercise.exercise_id
    )}`;
    if (user) navigate(picker);
    else navigate("/login", { state: { from: picker } });
  };

  const handleToggleFavorite = async () => {
    if (!user)
      return navigate("/login", {
        state: { from: `/exercises/${exercise.slug}` },
      });
    try {
      if (!favorited) {
        const r = await favoriteExercise(exercise.exercise_id);
        setFavorited(true);
        setFavoriteCount(Number(r.data.favorite_count || favoriteCount + 1));
      } else {
        const r = await unfavoriteExercise(exercise.exercise_id);
        setFavorited(false);
        setFavoriteCount(
          Number(r.data.favorite_count || Math.max(0, favoriteCount - 1))
        );
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Lỗi xử lý yêu thích");
    }
  };

  // --- RENDER ---
  return (
    <div key={String(idOrSlug)} className="max-w-6xl px-4 py-6 mx-auto">
      <button
        type="button"
        onClick={() => navigate("/exercises")}
        className="mb-4 text-blue-600 hover:underline"
      >
        Về Exercise
      </button>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-56 bg-gray-100 rounded animate-pulse" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-4 text-red-600 rounded bg-red-50">{error}</div>
      )}

      {/* Content */}
      {exercise && !loading && !error && (
        <div className="grid gap-6 md:grid-cols-10">
          <aside className="md:col-span-3">
            <div className="p-2 bg-white border rounded-lg">
              {mainMedia ? (
                <img
                  src={mainMedia}
                  alt={exercise.name}
                  className="object-cover w-full h-56 rounded"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-56 text-gray-400 bg-gray-100 rounded">
                  Không có media
                </div>
              )}
            </div>
            {/* Gallery Mini */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[exercise.gif, exercise.thumb]
                .filter(
                  (url, index, self) => url && self.indexOf(url) === index
                )
                .map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => setMainMedia(url)}
                    className={`rounded border p-0.5 transition ${
                      mainMedia === url
                        ? "border-blue-400 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`media-${idx}`}
                      className="object-cover w-full h-16 rounded"
                    />
                  </button>
                ))}
            </div>
          </aside>

          <section className="md:col-span-7">
            <div className="p-5 bg-white border rounded-lg shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {exercise.name}
                  </h1>
                  {exercise.name_en && (
                    <p className="text-sm text-gray-500">{exercise.name_en}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddToPlan}
                    className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    + Thêm vào Plan
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                      favorited
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "text-gray-700 border-gray-200 hover:bg-gray-50 border"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 mr-2 ${
                        favorited ? "text-red-600" : "text-gray-500"
                      }`}
                    />
                    {favorited ? "Đã yêu thích" : "Yêu thích"} ({favoriteCount})
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                {exercise.difficulty && (
                  <Badge tone="amber">Độ khó: {exercise.difficulty}</Badge>
                )}
                {exercise.type && (
                  <Badge tone="purple">Loại: {exercise.type}</Badge>
                )}
                {exercise.equipment && (
                  <Badge tone="blue">Dụng cụ: {exercise.equipment}</Badge>
                )}
              </div>

              {/* Muscles */}
              <div className="grid gap-3 mb-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-800">
                    Chính
                  </h3>
                  {!musclesLoading && muscles?.primary?.items?.length ? (
                    <ul className="space-y-2">
                      {muscles.primary.items.map((m) => (
                        <li key={m.id} className="text-sm">
                          {m.name} ({m.percent}%){" "}
                          <div className="w-full h-1 mt-1 bg-blue-100">
                            <div
                              className="h-1 bg-blue-500"
                              style={{ width: `${m.percent}%` }}
                            ></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {exercise.primaryMuscles.join(", ") || "—"}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-800">
                    Phụ
                  </h3>
                  {!musclesLoading && muscles?.secondary?.items?.length ? (
                    <ul className="space-y-2">
                      {muscles.secondary.items.map((m) => (
                        <li key={m.id} className="text-sm">
                          {m.name} ({m.percent}%){" "}
                          <div className="w-full h-1 mt-1 bg-green-100">
                            <div
                              className="h-1 bg-green-500"
                              style={{ width: `${m.percent}%` }}
                            ></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {exercise.secondaryMuscles.join(", ") || "—"}
                    </p>
                  )}
                </div>
              </div>

              {exercise.description && (
                <div className="mb-5 prose-sm prose max-w-none">
                  <h3 className="mb-1 text-sm font-medium text-gray-800">
                    Mô tả
                  </h3>
                  <p className="text-gray-700">{exercise.description}</p>
                </div>
              )}

              {/* Instructions */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-800">
                  Hướng dẫn từng bước
                </h3>
                {exercise.instructions?.length ? (
                  <ol className="space-y-2">
                    {exercise.instructions.map((s, i) => (
                      <li
                        key={i}
                        className="p-3 text-sm text-gray-800 border border-gray-100 rounded-md bg-gray-50"
                      >
                        <span className="mr-2 font-medium text-gray-600">
                          Bước {s.step_number || i + 1}:
                        </span>
                        {s.instruction_text || s.text || JSON.stringify(s)}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-gray-500">
                    Chưa có hướng dẫn chi tiết.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Related */}
      {!!related?.length && (
        <div className="p-5 mt-6 bg-white border rounded-lg shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            Bài tập liên quan
          </h3>
          <div className="flex gap-4 pb-2 overflow-x-auto">
            {related.map((ex) => (
              <button
                key={ex.id}
                onClick={() =>
                  navigate(`/exercises/${encodeURIComponent(ex.id)}`, {
                    state: ex,
                  })
                }
                className="flex-shrink-0 w-56 text-left border rounded-lg hover:shadow-sm"
              >
                <img
                  src={ex.imageUrl || ""}
                  alt={ex.name}
                  className="object-cover w-full bg-gray-100 rounded-t-lg h-36"
                />
                <div className="p-3">
                  <div className="text-sm font-medium line-clamp-2">
                    {ex.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
